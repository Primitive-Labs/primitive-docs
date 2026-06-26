# Workflow Agent Guide

Workflows are multi-step server-side automations defined in TOML. Each step is one of a fixed set of `kind`s (LLM call, integration call, prompt execute, database op, email, blob, etc.). Steps run sequentially with template-rendered inputs and a shared output context.

This guide is the source of truth for what's actually in `src/workflows/`. Examples are kept short and load-bearing.

## TOML structure

```toml
[workflow]
key = "my-workflow"               # required, unique per app
name = "My Workflow"              # required
description = "..."               # optional
status = "draft"                  # draft | active | archived
accessRule = "hasRole('admin')"  # optional CEL
runAs = "caller"                  # caller (default) | system — see Execution identity
capabilities = ["membership"]    # system-only opt-in grants
perUserMaxRunning = 4             # default 4
perUserMaxQueued = 100            # default 100
dequeueOrder = "fifo"             # fifo | lifo (default fifo)
inputSchema  = "{\"type\":\"object\", ...}"   # JSON-encoded JSON Schema
outputSchema = "{\"type\":\"object\", ...}"

[[steps]]
id = "step-1"
kind = "transform"
saveAs = "output"
[steps.output]
greeting = "Hello {{ input.name }}"
```

Workflow-level fields the engine actually reads:
`perUserMaxRunning`, `perUserMaxQueued`, `perAppMaxRunning` (default 25), `perAppMaxQueued` (default 10000), `queueTtlSeconds` (default 43200), `dequeueOrder`, `accessRule`, `runAs` (default `caller` — see "Execution identity" below), `capabilities` (system-only grants), `inputSchema`, `outputSchema`, `requiresClientApply` (default `true` — see "Client apply" below), `syncCallable` (default `false` — see "Synchronous invocation" below). Sync pushes the schema fields, access rule, `runAs`/`capabilities`, queue settings, step list, `requiresClientApply`, and `syncCallable`.

### Per-step common fields

All steps support these in addition to their own:

| Field | Purpose |
|---|---|
| `id` (req) | Unique within the workflow |
| `kind` (req) | Step type — see list below |
| `name`, `description` | Optional human-readable labels surfaced in CLI/admin views |
| `runIf` | CEL expression; skip step if false |
| `selector` | Override `selected` context (`{ source = "step", stepId = "..." }` or `{ source = "context", path = "outputs.x" }`) |
| `saveAs` | Also store output under `outputs[saveAs]` |
| `forEach` | Iterate over a list expression (path to array, or to `{items: [...]}`), or a `{ zip, as }` table for parallel-array iteration |
| `as` | Loop variable name (default exposes `selected`) |
| `maxItems` | forEach cap (default 200) |
| `concurrency` | Parallel forEach lanes (integer 1-100; default 1 = sequential). Results preserve insertion order. |
| `successWhen` | CEL predicate evaluated per forEach iteration to classify the result as functionally succeeded vs empty (see `forEach` below) |
| `continueOnError` | Capture errors as `{ error, errorDetails, ok: false, errored: true }` instead of failing the workflow |
| `skipWhenSkipped` | Array of earlier step ids. Before this step's own `runIf` is evaluated, skip this step (with the same `{ ok: false, skipped: true }` stub) if any listed upstream was skipped. Transitive; reacts only to `skipped: true`, not `errored: true`. Unknown/forward ids are tolerated at run time and warned at save time. |
| `strict` | Throw if any template expression in this step is unresolved |

## Data flow

A run threads one JSON context through every step:

1. **Input**: one JSON object per run — the `start()`/`runSync()` input, the webhook's mapped payload, or the cron trigger's configured input. Validated against `inputSchema` when declared.
2. **Step config is templated at execution time**: steps have no implicit input argument — `{{ ... }}` expressions in config strings resolve against the run context (`input`, `steps.<id>`, `outputs.<saveAs>`, `secrets`, `meta`, forEach vars) just before the step runs (see [Templating](#templating)).
3. **Output recording**: each step's JSON result is stored as `steps[id]`; `saveAs = "name"` also registers it as `outputs.name` — a stable alias that survives step-id renames. The engine stamps the uniform verdict (`ok`, plus `skipped`/`errored`) on every entry.
4. **Final result**: `outputs.output` if any step used `saveAs = "output"`, otherwise the full `outputs` map (see [Output contract](#output-contract)). Every step's input and output stays on the run record.

## Step types

Every kind below is registered in `src/workflows/runner/default-registry.ts`. If a kind isn't listed here, it doesn't exist.

The network-reaching kinds are bounded by a per-step timeout: `llm.chat` and `gemini.generate` default to 120000 ms, the `database.*` steps and `email.send` to 30000 ms. Override per step with a `timeout` field (milliseconds). A step that exceeds its timeout fails non-retryably and records a failed step-run instead of hanging the run.

### `transform`

Returns the templated `output` field. Use this for shaping the workflow's final output.

```toml
[[steps]]
id = "final"
kind = "transform"
saveAs = "output"
[steps.output]
greeting = "Hello {{ input.name }}"
items = "{{ steps.fetch.data }}"     # single-expression mode preserves arrays
```

### `noop`

Returns `{ message, payload }`. For testing.

### `switch`

First-match branching. Cases are CEL `when` expressions evaluated top-to-bottom in the same scope as `runIf`; the first truthy case's `output` is templated and returned. Non-selected cases are NOT templated, so they can safely reference outputs of steps that didn't run.

```toml
[[steps]]
id = "tier"
kind = "switch"
saveAs = "plan"

[[steps.cases]]
when = "input.score >= 90"
[steps.cases.output]
label = "gold"
discount = 0.2

[[steps.cases]]
when = "input.score >= 70"
[steps.cases.output]
label = "silver"
discount = 0.1

[steps.default]
[steps.default.output]
label = "standard"
discount = 0
```

`default` is opt-in. Omit it and a no-match throws `Switch step '<id>' had no matching case and no default`. An explicit `default = { output = null }` skips on no-match (the step output is `null`).

### `delay`

```toml
[[steps]]
id = "wait"
kind = "delay"
ms = 5000               # number, or "5 seconds" / "200ms"
```

### `event.wait`

Suspends the workflow until a matching event is delivered to the run via the engine's event API.

```toml
[[steps]]
id = "wait-approval"
kind = "event.wait"
type = "user-approval"
timeout = 86400000      # milliseconds (number)
```

### `llm.chat`

OpenRouter chat completion.

```toml
[[steps]]
id = "ask"
kind = "llm.chat"
model = "gpt-4o-mini"
saveAs = "answer"

[[steps.messages]]
role = "system"
content = "You are concise."

[[steps.messages]]
role = "user"
content = "{{ input.question }}"
```

Optional: `temperature`, `top_p`, `attachments`, `plugins`, `tools`, `tool_choice`. **No `maxTokens`** — use `prompt.execute` with a managed prompt to control max tokens.

Output shape: whatever the LLM controller returns — typically `{ content, role, metrics }`.

### `gemini.generate`

```toml
[[steps]]
id = "extract"
kind = "gemini.generate"
model = "models/gemini-2.5-flash"
thinkingLevel = "minimal"   # Gemini 3 only — minimal | low | medium | high

[steps.prompt]
[[steps.prompt.messages]]
role = "user"
[[steps.prompt.messages.parts]]
type = "text"
text = "Summarize: {{ input.content }}"
```

`prompt` may be an object (forwarded as the body) or an array of messages. `gemini.generateRaw` is the same shape, forwarded as a raw API payload. `gemini.countTokens` returns a token count.

The effective model — `prompt.model` when `prompt` is an object, otherwise the top-level `model` — is validated against the server's Gemini model allow-list **at save time**: a disallowed model rejects the workflow save (the error names the step index and lists the allowed models) instead of failing at run time. A model containing template syntax resolves at run time and is validated then.

### `prompt.execute`

Execute a managed prompt (configured separately via the prompts API/CLI).

```toml
[[steps]]
id = "summarize"
kind = "prompt.execute"
promptKey = "summarizer"      # required, must be active
saveAs = "summary"
# configId = "..."             # optional, override active config
# modelOverride = "gpt-4o"     # optional

[steps.variables]
text = "{{ input.content }}"
```

Output: result from the prompt config's provider — typically `{ content, role, metrics }`.

### `integration.call`

```toml
[[steps]]
id = "fetch"
kind = "integration.call"
integrationKey = "weather-api"     # required, must match a configured integration
saveAs = "weather"
# bodyMode = "json"                 # json (default) | raw | multipart

[steps.request]
method = "GET"
path = "/current"

[steps.request.query]
city = "{{ input.city }}"

[steps.request.headers]
X-Custom = "value"
```

Optional: `attachments`, `multipartFields` (for `bodyMode = "multipart"`).

Integration `defaultHeaders` and `staticQuery` resolve `{{secrets.KEY}}` from app secrets — workflow steps cannot put secrets into `request.headers` directly without exposing them in step output snapshots. Put secrets in the integration config.

### `database.query` / `mutate` / `count` / `aggregate` / `pipeline` / `applyToQuery`

All take `databaseId`, `operationName`, optional `params`. Query takes `limit`, `sort`, `cursor`, `direction`. All accept `dryRun = true`.

```toml
[[steps]]
id = "list"
kind = "database.query"
databaseId = "{{ input.dbId }}"
operationName = "listActiveUsers"
limit = 50
saveAs = "users"
[steps.params]
status = "active"
# Output: { data: [...], hasMore?, nextCursor? }

[[steps]]
id = "create-task"
kind = "database.mutate"
databaseId = "{{ input.dbId }}"
operationName = "createTask"
[steps.params]
title = "{{ input.title }}"
# Output: { results: [{ success: true, id }] }
# Each entry has `success` (not `ok`) + `id`. Failures throw — a result entry's
# presence implies it succeeded. In `runIf`, prefer the step-level verdict
# `steps['create-task'].ok` (true iff every result item succeeded) or
# `size(steps['create-task'].?results) > 0`.

[[steps]]
id = "mark-overdue"
kind = "database.applyToQuery"
databaseId = "{{ input.tasksDbId }}"
operationName = "mark-overdue"      # NOTE: uses `operationName`, not `operation`
[steps.params]
now = "2026-04-27T00:00:00Z"
# Output: { matched, updated, truncated? }
```

Workflows have no batch-write step kind. To apply a set of updates, run `forEach` over a `database.mutate` step (see `forEach` below), or use `database.applyToQuery` for query-driven updates.

### `document.query` / `queryOne` / `count` / `save` / `patch` / `delete`

Read and write records in a document's models server-side. All take `documentId` + `modelName`. Writes are durable when the step completes and reach connected clients like any other document change — they do not use the client-apply flow (`requiresClientApply` is for results only clients write).

| Kind | Additional fields | Output |
|---|---|---|
| `document.query` | optional `filter`, `options` | `{ data: [...], hasMore?, nextCursor? }` — `collect`-compatible |
| `document.queryOne` | optional `filter`, `options` | `{ record }` — `null` when nothing matches (does not fail) |
| `document.count` | optional `filter` | `{ count }` |
| `document.save` | `recordId`, `data` | `{ record }` — creates or replaces the record at `recordId` |
| `document.patch` | `recordId`, `data` | `{ record }` — merges `data` fields into the record |
| `document.delete` | `recordId` | `{ deleted: true, id }` |

`filter` uses the same operator syntax as client-side model queries; empty or omitted matches all records. `options` supports `sort` (`{ field = 1 }` / `-1`), `limit`, and cursor pagination (`uniqueStartKey` — feed it the previous page's `nextCursor`).

Writing a `stringset` field (which also backs `refersToMany`) in `save`/`patch` `data` takes either a plain array — `{ tagNames: ["a", "b"] }`, which **replaces** the whole set — or a per-member delta op-object `{ $add?: [...], $remove?: [...], $clear?: true }`. The delta applies `$clear` first, then `$remove`, then `$add` (so `$add` wins a tie), touching only the named members, so it merges cleanly with concurrent client `.add()` / `.delete()`. A returned stringset field reads back as a member array. The op-object is rejected on a non-collection field; a declared stringset given a non-array, non-op value also fails.

```toml
[[steps]]
id = "overdue"
kind = "document.query"
documentId = "{{ input.docId }}"
modelName = "Invoice"
saveAs = "invoices"
[steps.filter]
status = "overdue"
amount = { "$gt" = 100 }
[steps.options]
sort = { dueDate = 1 }
limit = 50

[[steps]]
id = "mark-paid"
kind = "document.patch"
documentId = "{{ input.docId }}"
modelName = "Invoice"
recordId = "{{ input.invoiceId }}"
[steps.data]
status = "paid"
```

A missing `documentId`/`modelName` (or `recordId` on a write), or a `documentId` that doesn't resolve to a document, fails the step non-retryably.

**Caller-mode ACL.** When the run is `runAs: "caller"` (the default — see [Execution identity](#execution-identity-runas-system-workflows)), every op enforces the caller's per-document permission: `query`/`queryOne`/`count` need `reader`, `save`/`patch` need `read-write`, `delete` needs `owner`. A `null`/insufficient permission throws `DocumentAccessDeniedError` (non-retryable) — a templated/user-supplied `documentId` can't bypass the ACL. `runAs: "system"` runs app-privileged (no per-caller check).

**Targeting by alias.** Supply a `documentAlias { scope, aliasKey }` block instead of `documentId` (exactly one of the two). In a caller run, `scope = "user"` resolves the caller's own alias (forces `userId = caller`); `scope = "app"` resolves an app-scoped alias after checking the caller's effective permission. In a **system** run, a `scope = "user"` alias requires an explicit subject `userId` on the block — `documentAlias { scope = "user", aliasKey, userId }` — resolved app-privileged (see [subject-user methods](#subject-user-methods-system-workflows)). A non-resolving alias fails the step like a bad `documentId` (Option A — hard fail).

```toml
[[steps]]
id = "load"
kind = "document.query"
modelName = "Habit"
saveAs = "habits"
[steps.documentAlias]
scope = "user"
aliasKey = "tracker"
```

### `document.resolveAlias`

Resolve an alias to its id for conditional branching, without failing on a miss (Option B). Top-level `scope` (`"app"` | `"user"`) + `aliasKey`. Output `{ documentId }`, or `{ documentId: null }` when the alias doesn't resolve (or the caller lacks access — never leaks existence). Caller-mode only.

```toml
[[steps]]
id = "find-tracker"
kind = "document.resolveAlias"
scope = "user"
aliasKey = "tracker"
saveAs = "tracker"

[[steps]]
id = "seed"
kind = "document.save"
runIf = "outputs.tracker.documentId == null"
# ... create the user's tracker document
```

### `group.addMember` / `removeMember` / `checkMembership` / `listMembers` / `listUserMemberships`

```toml
[[steps]]
id = "add"
kind = "group.addMember"
groupType = "team"
groupId = "{{ input.teamId }}"
userId = "{{ input.userId }}"   # OR email = "...", not both
```

`addMember` is idempotent. With `email`, returns `{ status: "pending_signup", invitationId, inviteToken, ... }` if the email has no AppUser yet.

Group operations evaluate the group type's CEL rules. For workflow-issued operations, rules can match `fromWorkflow("workflowKey")`. In a system run, `addMember`/`removeMember` record `sys:<appId>` as the membership's `addedBy` (not the admin/cron/webhook that initiated the run).

### `collect`

Auto-paginate through any step that returns `{ items|data: [...], cursor|nextCursor }`.

```toml
[[steps]]
id = "all-users"
kind = "collect"
itemsField = "data"
cursorField = "nextCursor"
maxPages = 20
maxItems = 10000

[steps.step]
kind = "database.query"
databaseId = "{{ input.dbId }}"
operationName = "listUsers"
limit = 100
# Output: { items: [...all merged...], totalPages }
```

### `workflow.call`

Run a child workflow synchronously, inline. Child gets isolated `input` — it does NOT see parent's `steps`/`outputs`. Max call depth 10. Circular calls throw immediately.

```toml
[[steps]]
id = "onboard"
kind = "workflow.call"
workflowKey = "onboard-user"
[steps.input]
userId = "{{ item.userId }}"
# Output: { output: <child's outputs.output or full outputs>, childStepResults: [...] }
```

Add `forEach` to fan out: the child runs once per item (use `concurrency` for parallel lanes) and the step returns the array of child results. For app-wide, restartable fan-out over the whole user roster, use `iterate-users` instead.

### `email.send`

Two modes; pass exactly one of `templateType` or `htmlBody`.

```toml
# Template mode — uses a built-in or registered email template
[[steps]]
kind = "email.send"
templateType = "order-confirmation"
to = "{{ input.email }}"          # OR toUserId, not both
[steps.variables]
orderId = "{{ input.orderId }}"

# Inline mode — requires subject + htmlBody (textBody optional)
[[steps]]
kind = "email.send"
to = "{{ input.email }}"
subject = "Your report is ready"
htmlBody = "<p>Download: {{ outputs.upload.signedUrl }}</p>"
textBody = "Download: {{ outputs.upload.signedUrl }}"
```

`to` is a single address (string), not an array. Built-in templates: `magic-link`, `otp`, `document-share`, `document-share-deferred`, `waitlist-invite`, `waitlist-signup-notification`, `admin-invite`, `app-invite`, `access-request-created`, `access-request-resolved`. Register custom types with `primitive email-templates set <type>`. Hourly rate limit: 100 emails per app per hour (`workflowEmailByApp` in `src/config/rate-limits.ts`).

### `blob.upload` / `blob.download` / `blob.signedUrl`

Three separate kinds, NOT one `blob` step with an `action` field.

```toml
[[steps]]
id = "save"
kind = "blob.upload"
bucketKey = "reports"             # OR bucketId
filename = "{{ meta.workflowRunId }}.pdf"
contentType = "application/pdf"
contentBase64 = "{{ steps.gen.bytesBase64 }}"   # OR content (utf-8 string)
tags = ["monthly"]
# Output: { blobId, bucketId, bucketKey, filename, contentType, numBytes, sha256, tags }

[[steps]]
id = "url"
kind = "blob.signedUrl"
bucketKey = "reports"
blobId = "{{ steps.save.blobId }}"
expiresInSeconds = 3600           # 30..86400, default 300 (5 min)
# Output: { url, token, expiresAt, expiresInSeconds }

[[steps]]
id = "read"
kind = "blob.download"
bucketKey = "reports"
blobId = "{{ steps.save.blobId }}"
asBase64 = true                   # default false (returns utf-8 string)
# Output: { blobId, filename, contentType, numBytes, content?, contentBase64? }
```

### `analytics.write` / `analytics.query`

`analytics.write` emits up to 25 events per step.

```toml
[[steps]]
kind = "analytics.write"
action = "report.generated"
feature = "reports"
[steps.metrics]
durationMs = 1234
```

`analytics.query` runs a server-side analytics query. Always lock down the workflow with `accessRule = "hasRole('admin')"` — the runner rejects non-admin callers by default. Per-run cap of 50 queries.

```toml
[[steps]]
kind = "analytics.query"
queryType = "users.top"            # see list below
windowDays = 7
limit = 25
saveAs = "topUsers"
# cacheTtlSeconds = 0              # 0/null = bypass cache
```

Valid `queryType` values (dotted form, exact strings):
`overview.dau`, `overview.wau`, `overview.mau`, `overview.growth`, `daily-active`, `rolling-active`, `cohort-retention`, `users.top`, `users.search`, `users.detail`, `users.snapshot`, `events`, `events.grouped`, `workflows.top`, `prompts.top`, `integrations`. `users.detail` and `users.snapshot` require `userUlid`.

Optional fields:

- `groupBy` — for `events.grouped`. One of `action`, `feature`, `day`, `route`, `country`, `deviceType`, `plan`.
- `filters` — for `events` and `events.grouped`. Array of `{ field, operator, value }` (max 10 entries; values capped at 200 chars). Same field/operator set as the `/analytics/events` REST endpoint.
- `page` — 0-indexed page number for the `events` feed.
- `query` — search string (email or ULID) for `users.search`.

```toml
[[steps]]
kind = "analytics.query"
queryType = "events.grouped"
windowDays = 7
groupBy = "feature"
filters = [
  { field = "feature", operator = "is",       value = "billing" },
  { field = "action",  operator = "contains", value = "upgrade" },
]
saveAs = "billingUpgrades"
```

### `script`

Runs a sandboxed [Rhai](https://rhai.rs/) script over JSON input and returns JSON. Use it for transforms too involved for a templated `transform` step (nested reshaping, derived fields, array map/filter/reduce). The sandbox is **deterministic and side-effect-free** — no network, clock, or storage access — so script steps are safe to retry and easy to test. The [Scripts guide](AGENT_GUIDE_TO_PRIMITIVE_SCRIPTS.md) covers the script model, input/output contract, limits, error codes, and gotchas in full; this section is the step-level reference.

```toml
[[steps]]
id = "normalize"
kind = "script"
ref = "normalize-order"     # required — the Script name (unique per app)
saveAs = "order"
# configId = "..."          # optional — pin a specific ScriptConfig for determinism
[steps.with]                # input context passed to the script (templated by the engine)
raw = "{{ steps.fetch.body }}"
currency = "{{ input.currency }}"
```

The referenced body (`transforms/normalize-order.rhai`):

```
let items = input.raw.items.filter(|i| i.qty > 0);
let total = 0.0;
for i in items { total += i.qty * i.price; }
#{
  currency: input.currency,
  itemCount: items.len(),
  total: total,
}
```

Given `steps.fetch.body = { "items": [{ "sku": "a1", "qty": 2, "price": 5.0 }, { "sku": "b2", "qty": 0, "price": 9.0 }] }` and `input.currency = "USD"`, the step records `steps.normalize.output = { "currency": "USD", "itemCount": 1, "total": 10.0 }`.

- `ref` (required) names a `Script` — a stored Rhai body, unique per app. Script bodies live in `transforms/<name>.rhai` in your sync directory and are mirrored to the server by `primitive sync push` (and pulled back by `primitive sync pull`); the `<name>` is the filename without `.rhai`. There is no separate `transforms` CLI command — scripts ride the normal sync flow.
- `with` is the JSON context handed to the script. Inside the script the whole table is exposed as **`input.*`** (with `ctx.*` as an alias) — NOT as bare top-level variables. `let x = payload;` fails with `Variable not found: payload`; write `input.payload`. Also, `with` itself is a reserved Rhai keyword — a script can't declare a variable named `with`.
- **Result nesting.** A script step's return value lands under `steps.<id>.output.*` (alongside `scriptMetrics` and the engine's `ok`) — unlike `transform`, whose result is the templated table directly (`steps.<id>.<field>`). Wire downstream templates/`runIf` as `{{ steps.normalize.output.total }}`, not `{{ steps.normalize.total }}`.
- **Script bodies resolve live at run time.** The runner looks up the script's active config body on each execution; there is no publish-time snapshot. Pushing a changed `.rhai` file (`primitive sync push`) creates a new config and activates it — referencing workflows pick up the new body on their next run with no re-publish step. Pin a specific config with `configId = "..."` on the step to bypass the active-config lookup when determinism is required.
- Handy patterns: `parse_json(input.someJsonString)` for JSON-string fields (e.g. payload columns stored as strings); missing keys read as `()` (test with `h.symbol != ()`); `NaN`/`Infinity` can't survive JSON output — they serialize as `null`, so return a sentinel instead.
- **`parse_json` parses any strict-JSON value** — object→map, array→array, plus primitives and `null` — so a field storing a JSON array string parses straight into an array. Input must be strict JSON (no trailing commas, comments, single quotes, or hex literals); invalid input fails the step with a non-retryable `SCRIPT_RUNTIME_ERROR` and a positioned message.
- `limits` (optional) lets a step lower the per-run ceilings (`maxOperations`, `wallMsHint`, `maxOutputBytes`, `maxArrayLength`, `maxObjectKeys`, `maxNestingDepth`, `maxStringSize`, `maxCallDepth`, `maxLogBytes`); requested values are clamped at the app ceiling, never raised.
- Deterministic failures (parse / compile / runtime / limit / validation) come back as a non-retryable step error so durable retries don't re-run a guaranteed failure; transient/transport errors throw and retry normally. The runtime fails closed — it never silently passes input through.
- Each execution records per-step telemetry on the `WorkflowRun.scriptMetrics` array (operation counts, input/output byte sizes, runtime version), visible in run detail.

### `iterate-users`

Fans a child workflow out across **every user in the app**, once per user, as a restartable singleton. Built for large per-user batch jobs (backfills, per-user digests, recomputations) that must survive restarts without re-processing completed users or holding the whole user set in memory. **System-only** — the workflow must set `runAs = "system"` (see [Execution identity](#execution-identity-runas-system-workflows)), else it's rejected at save time.

```toml
[[steps]]
id = "backfill"
kind = "iterate-users"
iterationName = "2026-06-prefs-backfill"   # required — stable name; identifies this iteration
saveAs = "backfillResult"
pageSize = 100                # users fetched per page (default 100)
concurrency = 25             # per-page fan-out (default 25, max 100)
onConflict = "skip"          # "skip" (default) | "refuse" if an iteration is already running
onPartialFailure = "continue" # "continue" (default) | "fail"
[steps.source]
mode = "app"                 # iterate the app's full user roster
[steps.perUser]
workflowKey = "process-one-user"   # the per-user workflow to run
[steps.perUser.input]               # static input merged into each child run
reason = "preferences backfill"
```

- **Bounded memory**: users are paged (`pageSize`) rather than loaded all at once, so the step scales to large user counts.
- **Singleton per app**: a per-app lock (`iterationName` keys it) guarantees only one iteration runs at a time and tracks aggregate progress, so a restarted run resumes where it left off instead of starting over. `onConflict` decides whether a second start `skip`s or `refuse`s while one is live.
- Each user is processed by the `perUser.workflowKey` child workflow. The iterated user's id is injected into the child as `input.userId` automatically, so a child with no `perUser.input` block still reads `{{ input.userId }}`. `onPartialFailure` controls whether per-user failures stop the whole iteration or are tallied and skipped.
- `perUser.input` values are rendered per user against a `user` binding (`user.userId`, `user.role`) with full template syntax — filters and fallbacks included (`{{ user.userId | upper }}`, `{{ user.role || 'member' }}`). A key set in `perUser.input` overrides the injected `userId` default (author-wins).
- Prefer `iterate-users` over a hand-rolled `forEach` across a `users.list` query when the fan-out is app-wide and long-running; `forEach` is better for bounded, in-run collections.

## Templating

`{{ ... }}` resolves paths into the run context. Context vars:

| Var | Source |
|---|---|
| `input` | The `rootInput` passed to start() |
| `selected` | Result of `selector` (or current `forEach` item if no `as`) |
| `steps` | `steps[stepId]` for every prior step |
| `outputs` | `outputs[saveAs]` for every prior `saveAs` |
| `meta` | The `meta` you passed to `start()` — **NOT auto-populated.** No `meta.startedAt`/`meta.userId` unless you set them. |
| `secrets` | App secrets (read-only) |
| `<asVar>` | Current item inside a `forEach` step |
| `loop`, `iteration` | `{ index, count, first, last }` inside `forEach` (use `iteration` in CEL `runIf` since `loop` is reserved) |
| `now`, `today`, `uuid`, `ulid` | Built-in zero-arg helpers (see below) |

### Built-in template helpers

Four zero-arg helpers are always available in templates. They re-evaluate on every reference — `{{ now }} {{ now }}` produces two different timestamps.

| Name | Returns |
|---|---|
| `now` | Current ISO 8601 timestamp (e.g. `2026-05-20T14:38:00.123Z`) |
| `today` | Current UTC date as `YYYY-MM-DD` |
| `uuid` | Fresh random UUID v4 |
| `ulid` | Fresh random ULID (lexicographically sortable) |

```toml
filename = "report-{{ today }}-{{ ulid }}.pdf"
correlationId = "{{ uuid }}"
generatedAt = "{{ now }}"
```

User-provided keys win over built-ins. If you bind `as = "uuid"` in a forEach, pass `input.now`, or have a step output named `today`, the user value shadows the built-in for that scope.

**Single-expression mode**: when the entire string is one `{{ ... }}`, the raw value (array/object) is returned, not stringified. Otherwise expressions are coerced to strings and interpolated.

**Fallback** with `||`:

```
"{{ input.title || 'Untitled' }}"
"{{ input.a || input.b || 'default' }}"
```

**Filters** with `|` (single pipe — `||` is fallback):

```
{{ input.data | json }}                         # pretty JSON
{{ input.tags | join: ', ' }}
{{ input.items | length }}
{{ input.users | pluck: 'email' | uniq }}
{{ input.list | where: 'status', 'active' }}
{{ input.list | sort: 'name' | first }}
{{ input.text | upper | truncate: '100' }}
{{ input.amount | toFixed: '2' }}
{{ input.x | default: 'fallback' }}
{{ input.id | expect: 'string' }}              # throws on type mismatch
```

Available filters (see `src/workflows/runner/templates.ts` for full list):
- Type: `json`, `string`, `number`, `boolean`, `default`, `expect`
- String: `upper`/`uppercase`, `lower`/`lowercase`, `trim`, `split`, `replace`, `truncate`, `startsWith`, `endsWith`, `contains`
- Array: `length`/`size`, `first`, `last`, `keys`, `values`, `join`, `pluck`, `where`, `sort`, `reverse`, `flatten`, `uniq`, `compact`, `slice`, `concat`
- Number: `round`, `floor`, `ceil`, `abs`, `toFixed`
- Date: `now`, `toISOString`

Templates have **no arithmetic** (`{{ a + b }}` won't work). Move math into a step or filter chain.

**Missing path sentinel.** In interpolation mode (`"prefix-{{ steps.x.y }}-suffix"`), an unresolved path renders as `<missing: steps.x.y>` so it's visible in step output and logs. In single-expression mode (`"{{ steps.x.y }}"` alone) the raw value is `null` so downstream `runIf`/comparisons work naturally. A resolved `null` interpolates as `"null"`; a resolved empty string interpolates as `""`. Set `strict = true` on the step to throw on any unresolved path instead.

## `runIf` (CEL, not templates)

```toml novalidate
runIf = "input.shouldRun"                        # truthy
runIf = "outputs.text.length < 1000"             # comparison
runIf = "steps.check.isMember && input.amount > 0"
runIf = "steps.previous.ok"                      # uniform verdict on every step
runIf = "!steps.fetch.skipped"
```

CEL context: `input`, `selected`, `steps`, `outputs`, `meta`, `secrets`, plus `iteration` (and `as`-var) inside `forEach`. **Do NOT wrap in `{{ }}`** — `runIf` parses CEL directly. A CEL evaluation error fails the step (or is captured by `continueOnError`).

### Safe navigation

CEL optional types are enabled in every workflow context (`runIf`, `accessRule`, group/database access rules, cron triggers). Use them to collapse multi-conjunct null guards into single-line expressions.

| Syntax | Meaning |
|---|---|
| `steps.foo.?bar` | Optional field access — returns an optional, never throws on missing |
| `steps.foo[?"bar"]` | Optional index access (same, for map/list lookups) |
| `expr.orValue(default)` | Unwrap optional, falling back to `default` |
| `expr.hasValue()` | True if the optional is set |
| `optional.of(x)` / `optional.none()` | Construct optionals explicitly |

Common operations work directly on optional values — no `.orValue()` unwrap needed:

| Expression | Semantics |
|---|---|
| `size(steps.x.?data)` | `none` → `0`; `some(xs)` → `xs.size()`. Works for lists, maps, strings, bytes. |
| `steps.x.?body.?token != ''` | `none` is never equal to any scalar value (absent ≠ empty string). |
| `steps.x.?body.?err == null` | `none == null` is `true` (absent path treated as null). |

```cel
runIf = "size(steps['fetch'].?data) > 0"
runIf = "steps['profile'].?body.?err != null"
runIf = "steps['profile'].?body.?token != ''"
```

You can still use `.orValue()` and `.hasValue()` when you need explicit control over the fallback value:

```cel
runIf = "steps.fetch.?data.?items.orValue([]).size() > 0"
runIf = "steps.profile.?role.hasValue() && steps.profile.role == 'owner'"
```

Without safe navigation, `steps.fetch.data.items` throws on any missing intermediate; with it, the chain short-circuits to `optional.none()`.

## `forEach`

```toml
[[steps]]
id = "notify"
kind = "email.send"
forEach = "steps.team.items"
as = "member"
maxItems = 500
to = "{{ member.email }}"
subject = "Update"
htmlBody = "<p>Hi {{ member.name }}</p>"
```

Output is always `{ items: [...per-iter results], errors: [{index, error}], totalSucceeded, totalFailed, totalEmpty, ok }` — even when there are no errors. Results are ordered by input index regardless of completion order. `ok` is `true` iff every iteration succeeded (and the source was non-empty); use it in `runIf` on the next step.

**Parallel forEach** — add `concurrency` to fan out iterations across multiple lanes:

```toml
[[steps]]
id = "notify"
kind = "email.send"
forEach = "steps.team.items"
as = "member"
concurrency = 5           # run up to 5 iterations at once
maxItems = 500
to = "{{ member.email }}"
subject = "Update"
htmlBody = "<p>Hi {{ member.name }}</p>"
```

When `concurrency = 1` (the default), iterations are sequential. When `concurrency > 1`, the engine fans them out in parallel batches — in durable mode each batch runs as a child workflow so restarts don't re-run completed items. For app-wide, restartable fan-out that must survive restarts without re-processing completed users, use `iterate-users`.

When a parallel `forEach` batch's combined output exceeds the inline size limit (~1 MB), the engine automatically offloads the batch result to managed object storage and rehydrates it transparently for the next step. Large per-iteration outputs are handled for you, but the offload adds a storage round-trip — keep per-iteration outputs lean when you can.

### Batch database updates

Workflows have no batch-write step kind — a set of database updates is a `forEach` over a `database.mutate` step (add `concurrency` to parallelize):

```toml
[[steps]]
id = "import-contacts"
kind = "database.mutate"
forEach = "input.contacts"
as = "contact"
maxItems = 1000
databaseId = "{{ input.dbId }}"
operationName = "createContact"
[steps.params]
name = "{{ contact.name }}"
email = "{{ contact.email }}"
```

To mutate every record matching a server-side filter without enumerating items, use `database.applyToQuery` instead.

### Zip mode (parallel arrays by index)

When the inputs you want to iterate live in several arrays of the same length, use the `{ zip, as }` form. Each iteration binds one variable per `as` name from the matching `zip` expression at the same index.

```toml
[[steps]]
id = "send"
kind = "email.send"
forEach = { zip = ["steps.list.users", "steps.list.tokens"], as = ["user", "token"] }
to = "{{ user.email }}"
subject = "Your code"
htmlBody = "<p>Code: {{ token }}</p>"
```

This replaces the silently-corrupting `steps.list.tokens[iteration.index]` pattern — if the arrays drift in length, the engine surfaces it instead of indexing past the end.

### `successWhen` (functional success vs. empty)

For iterations that don't throw but didn't accomplish anything meaningful (e.g. an HTTP 200 with `body.matches = []`), use `successWhen` to classify the outcome.

```toml
[[steps]]
id = "lookup"
kind = "integration.call"
forEach = "input.queries"
as = "q"
successWhen = "result.body.matches.size() > 0"
[steps.request]
method = "GET"
path = "/search?q={{ q }}"
```

The predicate runs against each iteration's `result` plus the usual `input`/`steps`/`outputs`/`meta`/`iteration` context. Truthy → `functional_status: "succeeded"`; falsy → `"empty"`; throws → `"failed"` (the predicate is not evaluated). `totalEmpty` on the step output counts the empty bucket. A broken predicate falls back to `"succeeded"` and the workflow continues.

## Error handling

- **Default**: a failed step throws and the workflow fails.
- `continueOnError = true`: failure is captured as `steps[id] = { error, errorDetails }` and execution continues.
- `strict = true`: any unresolved template expression in the step throws with a path-listing error.
- `expect:` filter (in templates): runtime type check.
- `[[compensate]]` block at the top level runs after a failure (when `continueOnError` is not set). Compensate steps see `steps._error = { message, stepId }`. Compensate runs only in sync execution paths (e.g., `executeWorkflowSync`); not all engine modes invoke it.

```toml
[[steps]]
id = "deduct-token"
kind = "database.mutate"
# ...

[[steps]]
id = "call-api"
kind = "integration.call"
# fails here → compensate runs

[[compensate]]
id = "restore-token"
kind = "database.mutate"
runIf = "steps.deduct-token != null"
# ...
```

Per-step retries on transient errors are handled by the workflow engine automatically and are not configurable from TOML. Mark errors non-retryable by ensuring upstream calls return 4xx (the engine wraps 4xx≠429 as non-retryable).

## Output contract

After all steps run:

- `steps[id]` holds every step's output (including skipped/failed entries).
- `outputs[saveAs]` holds outputs for steps with `saveAs`.
- The workflow's final result is `outputs.output` if any step used `saveAs = "output"`, otherwise the full `outputs` map.

**Best practice**: end with a `transform` step using `saveAs = "output"` that explicitly shapes the return value.

### Uniform step verdict

Every entry in `steps[id]` carries a reserved verdict namespace alongside the runner's own fields:

| Field | When set |
|---|---|
| `ok: boolean` | Always. `true` if the step ran and the runner classified it as successful; `false` for skipped, errored, or kind-specific failures (e.g. an `integration.call` that returned HTTP 5xx) |
| `skipped: true` | The step's `runIf` evaluated falsy, or a step listed in its `skipWhenSkipped` was itself skipped. The runner did NOT execute. |
| `errored: true` | The step threw but was captured by `continueOnError = true` |
| `error`, `errorDetails` | Companion fields populated when `errored: true` |

`ok`, `skipped`, `errored`, `error`, and `errorDetails` are written by the engine and override any same-named field the runner would have produced. Downstream `runIf` and templates can rely on them on every step kind:

```toml novalidate
runIf = "steps.fetch.ok"
runIf = "!steps.fetch.skipped && !steps.fetch.errored"
```

When a step reads `steps.<upstream>.output.*` and that upstream can be skipped, a skipped upstream leaves no `output` key and an unguarded multi-segment read throws `No such key: output`. Two structural fixes: guard the read with safe navigation (`steps.fetch.?output.?items`), or declare `skipWhenSkipped = ["fetch"]` so the dependent auto-skips whenever `fetch` skips — its `runIf` is never evaluated. The skip is transitive and reacts only to `skipped: true` (an upstream that errored under `continueOnError` does not trigger it). List only earlier step ids; a save-time warning flags an unguarded skippable read or a `skipWhenSkipped` entry naming an unknown or forward step id.

## Access control

`accessRule` is a CEL expression. Evaluated when:
- A client calls `workflows.start()`.
- A `workflow.call` step invokes the workflow from another workflow.

NOT evaluated for inbound webhook triggers (those handle their own auth — e.g., Stripe signature). For webhook-triggered workflows, set `accessRule = "hasRole('owner')"` to prevent direct client invocation.

Behavior:
- No rule → any authenticated app member can start.
- `admin`/`owner` always bypass.
- Otherwise, evaluate against `user.userId`, `user.role`, plus `hasRole(role)`, `isMemberOf(groupType, groupId)`, `memberGroups(groupType)`.

Set `accessRule` once in the `[workflow]` TOML block and it sticks: `primitive sync push` and `primitive workflows create --from-file` both apply it (an absent/empty rule is sent as "no rule" rather than dropped). To change it later without re-pushing the file, `primitive workflows update <id> --access-rule "<CEL>"` sets it (pass `--access-rule ""` to clear; omitting the flag leaves the existing rule untouched).

## Execution identity (`runAs`, system workflows)

`runAs` declares the principal a run executes as — `caller` (default) or `system`. It's a top-level `[workflow]` field.

- `runAs = "caller"` (default) — the run executes as the invoking user. Every step acts with that member's permissions: `document.*` steps enforce the caller's per-document ACL, group/data ops are checked against their roles. `accessRule` gates who may start it.
- `runAs = "system"` — the run executes as the app's synthetic per-app principal (`sys:<appId>`, also the `WorkflowRun` partition key). App-privileged: the data baseline (document/database read/write/delete/manage) is unconditional.

The invocation gate is enforced once at top-level start (HTTP start/run-sync, cron, webhook, admin test) — never silently downgraded:

| invoker | `runAs:"caller"` | `runAs:"system"` |
|---|---|---|
| member | runs as the member | **403** "Members cannot run system workflows" |
| admin/owner | runs as the admin | runs as system |
| cron | **403** (cron may only run system workflows) | runs as system |
| webhook | **403** | runs as system |

Nested/child runs (`workflow.call`, durable `forEach` batches) never re-resolve identity — they inherit the parent's verbatim. Every system run records attribution (`initiatedByUserId` + `initiatorKind` of `admin`/`cron`/`webhook`/`test`) for audit; it is not a security control.

**Sensitive capabilities.** A system run gets the data baseline unconditionally. Sensitive operations are opt-in via `capabilities` (StringSet, allowlist-validated at save time):

```toml
[workflow]
key = "sync-roster"
runAs = "system"
capabilities = ["membership"]
```

`membership` gates the `group.addMember` / `group.removeMember` steps in a **system** run — without the grant they reject (`group.addMember requires the 'membership' capability`). Read-only group steps (`checkMembership`, `listMembers`, `listUserMemberships`) are never gated, and caller runs are governed by access rules, not capabilities, so the gate never applies to them.

**`iterate-users` is system-only.** A workflow containing an `iterate-users` step must set `runAs = "system"` — otherwise it's rejected at save time (`'iterate-users' is system-only and may appear only in a runAs:"system" workflow`).

**No `user`-referencing `accessRule` on a system workflow.** A `runAs:"system"` workflow whose `accessRule` references the `user` principal is rejected at save time (`runAs:"system" workflows do not evaluate accessRule (there is no caller principal) — remove the accessRule`), because a system run has no caller principal to evaluate against. A role- or group-only rule (e.g. `hasRole('admin')`) is inert but accepted.

### Subject-user methods (system workflows)

A system run can act **about** a specific app user without impersonating them — the run's actor stays `sys:<appId>` for audit; `userId` is an explicit **subject** parameter. The `*ForUser` step kinds are **system-only** (calling one from a `runAs: "caller"` run throws non-retryably: `<kind> is only supported in runAs:"system" workflows`). In each, `userId` may be set on the step or inherited from `input.userId` (e.g. the iterated subject under `iterate-users`). The subject must be an `AppUser` of the app, or the step fails non-retryably (`Subject user <id> is not a member of app <appId>`). These reads need no `capabilities` grant — being a system run is the gate.

| Kind | Key fields | Output |
|---|---|---|
| `user.get` | `userId` | `{ userId, email, name, appRole, rootDocId, disabled }` |
| `user.resolve` | `userId` **or** `email` | `{ userId: null }` on no app-member match, else `{ userId, user }` (`user` shaped like `user.get`) |
| `document.resolveAliasForUser` | `userId`, `aliasKey` | `{ documentId: string \| null, aliasKey, userId }` — app-privileged (alias existence ≠ subject access); `null` on miss (vs. the inline `documentAlias.userId` form, which hard-fails) |
| `document.listForUser` | `userId`, `limit?`, `includeRoot?` (default `true`), `ownerOnly?`, `tag?`, `cursor?`, `forward?` | `{ items: [DocumentInfo...], cursor? }` — direct + root grants only; group- or collection-reachable documents are enumerated via the dedicated `document.listForGroup` / `document.listForCollection` steps |
| `document.getForUser` | `userId`, `documentId`, `systemBypass?` | `{ document: DocumentInfo \| null, permission? }` — requires the subject's effective (direct + group) permission by default (`{ document: null }` when none); `systemBypass: true` reads by id app-privileged (`permission: "system"`) |
| `document.getOrCreateWithAliasForUser` | `userId`, `aliasKey`, `title?`, `permission?` (`read`\|`write`\|`owner`, default `write`), `tags?` | `{ documentId, aliasKey, userId, created }` — created with `createdBy = sys:<appId>`; subject gets the alias + the default grant; race-safe |
| `database.queryForUser` / `mutateForUser` / `countForUser` / `aggregateForUser` / `pipelineForUser` / `applyToQueryForUser` | same fields as the base `database.*` kind, plus `userId` | base kind's output; CEL rules + DB triggers evaluate as the **subject** (`user.userId`, `hasRole`, `isMemberOf` refer to the subject), actor stays system. `ok`/verdict semantics match the base kind |
| `analytics.writeForUser` | `userId`, `action`, `feature` | event attributed to the subject; system actor + workflow run id carried in the event context for audit |
| `document.listForGroup` | `groupType`, `groupId`, `permission?` (`reader`\|`read-write`\|`owner` filter), `limit?` (1–200, default 50), `cursor?` | `{ items: [DocumentInfo + nested `grant` `{groupType, groupId, permission, directGrant, sourceCollectionIds}`], cursor? }` — documents the group can access (direct + collection-derived in one query); item `permission` is the group's grant level. The `permission` filter is post-applied per page, so a filtered page can be short with a cursor still present — page until the cursor is absent. The reported grant level can be stale after mixed direct/collection revokes |
| `document.listForCollection` | `collectionId`, `limit?`, `cursor?` | `{ items: [DocumentInfo + `collectionId`/`addedAt`/`addedBy`, `permission: "system"`], cursor? }` — documents contained in a collection (membership, not per-user access) |
| `document.getRootForUser` | `userId` (subject, or inherited from `input.userId`), `create?` (default `false`) | `{ documentId: string \| null, userId, created }` — the subject's root document id; `create: true` race-safely assigns one (subject gets read-write) |

```toml
[[steps]]
id = "ensure"
kind = "document.getOrCreateWithAliasForUser"
userId = "{{ input.userId }}"   # explicit subject, or inherited from input.userId
aliasKey = "profile"
title = "Profile"

[[steps]]
id = "assignments"
kind = "database.queryForUser"
userId = "{{ input.userId }}"
databaseId = "{{ input.classroomDbId }}"
operationName = "listAssignments"
saveAs = "assignments"
```

Once a subject method returns a concrete `documentId`, the app-privileged `document.query` / `save` / `patch` / `delete` steps read/write it — there are **no** `*ForUser` write kinds. The CRUD `document.*` steps also accept `documentAlias { scope = "user", aliasKey, userId }` to resolve a subject's alias inline (hard-fails on miss).

## Inbound webhooks

External services trigger workflows via inbound webhooks. Define them as `webhooks/*.toml` in the sync directory and push with `primitive sync push`:

```toml
# config/webhooks/stripe-payments.toml
[webhook]
key = "stripe-payments"
displayName = "Stripe Payments"
workflowKey = "process-stripe"
verificationScheme = "stripe"     # stripe | github | slack | custom | none
status = "active"
# Optional: toleranceSeconds, deduplicationEnabled, deduplicationWindowMs,
# secretGracePeriodMs, [webhook.allowedIps] cidrs, [webhook.inputMapping]
```

Receive endpoint: `POST /app/{appId}/webhook/{webhookKey}`. The platform verifies the signature per `verificationScheme`, then starts `workflowKey` with the event payload as input; `inputMapping` (e.g. `"data.object"`) extracts a nested path first. Always pair a webhook-triggered workflow with `accessRule = "hasRole('owner')"` (see Access control above) so clients can't start it directly with a crafted payload.

CLI: `primitive webhooks list | get | create | update | delete | rotate-secret | test | events <webhook-key>` — `events` lists recent deliveries (accepted / rejected / duplicate / `workflow_not_active`).

A `workflow_not_active` delivery means the bound workflow was draft or archived when the event arrived: the request is acked with HTTP 202 `{ received: true }` (so the sender doesn't retry) but the workflow is **not dispatched**. Activate the workflow and resend — these events are excluded from deduplication, so the resend isn't dropped as a duplicate. Binding a webhook to a not-yet-active workflow succeeds and returns a non-blocking `warning` carrying `WORKFLOW_NOT_ACTIVE`.

## Cron triggers

A cron trigger fires a workflow on a clock schedule. It is one of the ways to invoke a workflow — a clock instead of a `workflows.start()` call or an inbound webhook. The trigger points at a workflow by `workflowKey`; the trigger itself runs no code.

**Decision rule:** trigger is a clock → cron trigger. Trigger is a user action or external webhook → `workflows.start()` or an inbound webhook, NOT cron.

### Critical rules

1. **Cron triggers fire workflows, not arbitrary code.** Create the workflow first (`status = "active"` with an active config/revision), then point the trigger at it via `workflowKey`.
2. **Set `requiresClientApply = false` on the target workflow.** Cron-triggered workflows almost always want this — otherwise the run sits in `apply_pending` forever because no client is listening.
3. **Set an IANA `timezone` whenever the schedule has a user-visible hour.** `0 9 * * *` in UTC is 2am in Los Angeles.
4. **`overlapPolicy` is `"skip"` (default) or `"allow"`.** There is no `"queue"`. `"skip"` checks whether the previous run is still active and increments `skippedCount`; `"allow"` always fires. Use `"allow"` only when each firing is independent and idempotent.
5. **Per-app cap is 50 cron triggers.**

### Creating (TOML / `primitive sync`)

```toml
# config/cron-triggers/nightly-digest.toml
[cronTrigger]
key = "nightly-digest"
displayName = "Nightly digest email"
cron = "0 9 * * *"
timezone = "America/Los_Angeles"
workflowKey = "send-digest"
overlapPolicy = "skip"
state = "active"

# Optional: static input passed to the workflow on every fire
[rootInput]
digestType = "daily"
environment = "production"

# Optional: dynamic input. `{{now}}` is replaced with the fire-time ISO string.
[inputMapping]
firedAt = "{{now}}"
```

```bash
primitive sync push
```

The TOML key `key` maps to the API field `triggerKey`. The field name is `cron` (not `schedule`).

### Creating (client / CLI)

```typescript
  const trigger = await client.cronTriggers.create({
    triggerKey: "nightly-digest",
    displayName: "Nightly digest email",
    cron: "0 9 * * *",                  // NOT `schedule`
    timezone: "America/Los_Angeles",    // set whenever the hour is user-visible
    workflowKey: "send-digest",
    overlapPolicy: "skip",              // "skip" (default) | "allow" — no "queue"
    rootInput: { digestType: "daily" }, // NOT `input`
    inputMapping: { firedAt: "{{now}}" }, // merged over rootInput; {{now}} = fire time
  });
  // trigger.triggerId is a ULID — use it for get/update/pause/test/delete.
```

Via the CLI:

```bash
primitive cron-triggers create \
  --key nightly-digest \
  --name "Nightly Digest" \
  --cron "0 9 * * *" \
  --workflow-key send-digest \
  --timezone "America/Los_Angeles" \
  --overlap-policy skip       # skip (default) | allow

# With per-firing input passed to the workflow:
primitive cron-triggers create \
  --key nightly-digest --name "Nightly Digest" --cron "0 9 * * *" \
  --workflow-key send-digest \
  --input '{"reportType":"daily","priority":"high"}'

# Or map fields from the trigger firing context into the workflow input:
primitive cron-triggers create \
  --key nightly-digest --name "Nightly Digest" --cron "0 9 * * *" \
  --workflow-key send-digest \
  --input-mapping '{"runId":"$triggerId","at":"$firedAt"}'
```

The CLI flags are `--key`, `--name`, `--cron`, `--workflow-key`, `--overlap-policy`, `--timezone`, `--input`, `--input-mapping` — NOT `--schedule` or `--workflow`. `--input` is a literal payload; `--input-mapping` projects fields from the firing context into the workflow input. Both are also accepted by `cron-triggers update`.

#### Wrong

```typescript
// WRONG — these field names don't exist
await client.cronTriggers.create({
  key: "nightly-digest",         // should be triggerKey
  schedule: "0 9 * * *",          // should be cron
  input: { ... },                 // should be rootInput
  overlapPolicy: "queue",         // not a valid value
  enabled: true,                  // no such field; use `state`
});
```

### Field reference

| Field | Required | Notes |
|-------|----------|-------|
| `triggerKey` | Yes | Per-app unique. Alphanumerics, `-`, `_`. Must start alphanumeric. |
| `displayName` | Yes | Human label. |
| `cron` | Yes | 5-field cron (see Syntax below). |
| `workflowKey` | Yes | Must refer to an existing workflow definition. |
| `timezone` | No | IANA name (validated via `Intl.DateTimeFormat`). Default `"UTC"`. |
| `overlapPolicy` | No | `"skip"` (default) or `"allow"`. |
| `rootInput` | No | JSON object, merged into workflow input. |
| `inputMapping` | No | JSON object, merged AFTER `rootInput`. Supports `{{now}}` substitution. |
| `description` | No | Free text. |
| `state` | Update only | `"active"` / `"paused"` / `"archived"`. Set on update; create always starts `"active"`. |

### Cron expression syntax

Standard 5-field POSIX: `minute hour day-of-month month day-of-week`.

Supported per field: `*`, exact (`5`), range (`5-10`), step on wildcard (`*/5`), step on range (`9-17/2`), comma list (`1,2,3`).

**Not supported:** month/day names, `?`, `L`, `W`, `#`, last-day modifiers, 6/7-field crons.

**Day-of-week:** `0` and `7` both mean Sunday, but `7` is only allowed as a bare value (NOT in ranges). Use `0` in ranges.

**Vixie semantics:** when both day-of-month and day-of-week are restricted, fires when EITHER matches.

| Need | Schedule |
|------|----------|
| Every 5 minutes | `*/5 * * * *` |
| Every hour on the hour | `0 * * * *` |
| Every day at 9am (local) | `0 9 * * *` + `timezone` |
| Every Monday at 9am | `0 9 * * 1` |
| First of every month | `0 0 1 * *` |
| Every 15 min, business hours, Mon–Fri | `*/15 9-17 * * 1-5` |

Invalid expressions are rejected at create time. If the cron later becomes unparseable (rare), the trigger transitions to `state: "error_paused"` with `lastError` set; alarms stop until you call `resume`.

### Workflow input shape

The workflow receives `rootInput` merged with `inputMapping` (latter wins on key collision), plus the `meta` object on the run record:

```typescript
// Inside the workflow:
input.digestType    // "daily"          (from rootInput)
input.firedAt       // "2026-04-27T..." (from inputMapping with {{now}})

// And on the run record:
run.contextDocId    // "cron:<triggerId>"
run.meta.source     // "cron"
run.meta.triggerId  // <triggerId>
run.meta.triggerKey // "nightly-digest"
run.meta.manual     // true if started via cronTriggers.test()
```

### Lifecycle methods

```typescript
  await client.cronTriggers.list();                       // excludes archived
  await client.cronTriggers.get(triggerId);               // includes runtime.scheduledAlarmAt
  await client.cronTriggers.update(triggerId, {           // change cron/timezone/state etc.
    cron: "0 8 * * *",
    timezone: "America/New_York",
  });
  await client.cronTriggers.pause(triggerId);             // cancels the pending alarm
  await client.cronTriggers.resume(triggerId);            // clears lastError, reschedules
  await client.cronTriggers.test(triggerId);              // fire NOW; does not touch schedule
  await client.cronTriggers.delete(triggerId);            // soft delete (archive)
```

`.test()`, `.pause()`, `.resume()`, `.delete()`, `.update()`, `.get()` all take the `triggerId` (ULID returned from `.create()`), NOT the `triggerKey`. Use `.list()` to look up `triggerId` by key. The same operations are available on the CLI:

```bash
primitive cron-triggers list
primitive cron-triggers get <trigger-id>          # includes runtime.scheduledAlarmAt
primitive cron-triggers test <trigger-id>         # fire now; does NOT affect schedule
primitive cron-triggers pause <trigger-id>
primitive cron-triggers resume <trigger-id>
primitive cron-triggers delete <trigger-id>
```

### Querying cron-triggered runs

There is no `triggerSource` filter on `workflows.listRuns()`. Cron runs are identifiable by their `contextDocId` starting with `cron:` and `meta.source === "cron"`:

```typescript
  const { items } = await client.workflows.listRuns({ workflowKey: "send-digest" });
  const cronRuns = items.filter((r) => r.contextDocId?.startsWith("cron:"));
```

### Managing triggers (client)

```typescript
  const { items } = await client.cronTriggers.list();
  const trigger = await client.cronTriggers.get(triggerId);
  await client.cronTriggers.test(triggerId); // fire once, now
```

### Debugging cron triggers

Trigger states:

- `active` — scheduled, alarm armed.
- `paused` — manual pause; alarm cancelled until `resume`.
- `error_paused` — set automatically when a fire fails hard (the target workflow is **not found**, or a binding/runtime error), when the cron expression becomes unparseable, or after 50 consecutive skips against a **not-active** target. `lastError` is populated (carrying `WORKFLOW_NOT_FOUND` or `WORKFLOW_NOT_ACTIVE`). Call `resume` to clear and reschedule.
- `archived` — soft-deleted; never returns from list.

A target workflow that is draft or archived (**not active**) does NOT error-pause on the first fire: the fire is skipped and rescheduled, `lastError` is set to `WORKFLOW_NOT_ACTIVE`, and `consecutiveNotActiveCount` increments. It auto-recovers once the workflow is activated (the counter resets and `lastError` clears); only after 50 consecutive not-active skips does it escalate to `error_paused`. A target that is **not found**, by contrast, error-pauses immediately.

`skippedCount` increments when `overlapPolicy: "skip"` blocks a fire because the prior run is still active — distinct from `consecutiveNotActiveCount`.

### Driving subscriptions from cron

A cron-spawned workflow that writes to a database wakes up every matching database subscription — cron writes → subscription broadcasts → UI renders, with no cron-awareness in the subscriber. The subscription side lives with databases; see the [Databases agent guide](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md#real-time-subscriptions). Cron/workflow writes arrive on the subscription with `originConnectionId: null` / `originUserId: null` and both `isOrigin` flags `false`.

## Client apply (footgun)

By default, `requiresClientApply = true`. After the workflow completes, status becomes `apply_pending` and a connected client must call `claimApply` → run `onApply` → `confirmApply` to finalize. If no client is listening, the run sits in `apply_pending` indefinitely.

For server-only workflows (no client follow-up), set `requiresClientApply = false` in the workflow TOML:

```toml
[workflow]
key = "nightly-digest"
requiresClientApply = false
```

`primitive sync push` pushes this flag. You can also set it via the CLI:

```bash
primitive workflows create --from-file workflow.toml --requires-client-apply false
primitive workflows update <workflow-id> --requires-client-apply false
```

## Synchronous invocation

Opt a workflow into synchronous invocation by setting `syncCallable = true` in the TOML (pushed by `primitive sync push`) or via `primitive workflows update --sync-callable true`. Once set, a caller can invoke the workflow and receive the final envelope in a single round-trip — useful for short, latency-sensitive tasks like input validation, enrichment lookups, or webhook handlers that must reply with a result.

Server-side constraints on a `syncCallable` workflow:

- **Step kinds are restricted.** The server validates step kinds against a sync-compatible list when the flag is set (or when steps are pushed against a sync-callable workflow). Long-running or suspending kinds (`event.wait`, `delay` over the timeout) reject at save time with `Workflow contains sync-incompatible steps`.
- **Timeout.** The invocation timeout defaults to 5s and is capped server-side at 30s (the server CPU budget per request). Exceeding it resolves with `status: "timeout"`.
- **Apply still applies.** A sync-callable workflow may still have `requiresClientApply = true`, in which case the synchronous call resolves with `status: "apply_pending"` and the normal `claimApply`/`confirmApply` flow takes over. Most sync-callable workflows want `requiresClientApply = false`.

Long-running workflows should keep using `start()` plus the WebSocket / polling lifecycle.

Call `workflows.runSync` and await the final envelope:

```typescript
  const result = await client.workflows.runSync({
    workflowKey: "validate-coupon",
    input: { code },
    timeoutMs: 5000, // default 5000; server caps at 30000
  });
  // → { runId, runKey, status, output?, error?, run?, existing? }
  // status: "completed" | "failed" | "terminated" | "timeout" | "apply_pending"
  // Resolves for every terminal outcome — only transport errors reject.
  if (result.status === "completed") {
    console.log(result.output);
  }
```

`runSync` also accepts `runKey`, `contextDocId`, and `meta` — the same idempotency and scoping fields as `start`.

An optional `signal` (`AbortSignal`) is accepted as well.

## Workflow lifecycle

A workflow needs `status = "active"` AND one of (active configuration | published revision) before clients can run it.

| Status | Active config/revision? | Client can run? | CLI preview? |
|---|---|---|---|
| `draft` | either | no | yes |
| `active` | yes (required) | yes | yes |
| `archived` | – | no | no |

Setting `status = "active"` without an active config or revision returns: `Cannot activate workflow without a configuration`.

`primitive sync push` creates a default configuration automatically when a workflow is first created and updates it on subsequent pushes. Each push of `[[steps]]` updates the active configuration's steps in place.

### Configurations vs revisions

- **Configurations** (recommended): named, mutable groupings of steps. One is `activeConfigId`. Created automatically on first sync push.
- **Revisions**: immutable snapshots created via `primitive workflows publish`. Prefer configurations.

## CLI

```bash
# Sync (recommended for everything; sync dir auto-resolves to .primitive/sync/<env>/<appId>/)
primitive sync init
primitive sync pull
primitive sync diff
primitive sync push --dry-run
primitive sync push

# Workflow CRUD (when not using sync)
primitive workflows list [--status active] [--json]
primitive workflows get <workflow-id>
primitive workflows create --from-file workflow.toml [--requires-client-apply false]
primitive workflows update <workflow-id> --status active
primitive workflows delete <workflow-id>           # archive
primitive workflows delete <workflow-id> --hard --yes

# Expand fragment includes (for debugging)
primitive workflows expand <workflow.toml>

# Preview a workflow
primitive workflows preview <workflow-id> --input '{"x":1}' --wait
primitive workflows preview <workflow-id> --config <config-id> --wait
primitive workflows preview <workflow-id> --draft --wait
# Preview source priority:
#   1. --config <id> if provided
#   2. --draft if flag set
#   3. active configuration (default)
#   4. draft (fallback if no active config)

# Draft / publish (revision flow)
primitive workflows draft update <workflow-id> --from-file workflow.toml
primitive workflows publish <workflow-id>

# Configurations
primitive workflows configs list <workflow-id>
primitive workflows configs get <workflow-id> <config-id>
primitive workflows configs create <workflow-id> --name "production" --from-file workflow.toml
primitive workflows configs update <workflow-id> <config-id> --from-file workflow.toml
primitive workflows configs activate <workflow-id> <config-id>
primitive workflows configs duplicate <workflow-id> <config-id> --name "experiment-v2"
primitive workflows configs archive <workflow-id> <config-id>

# Run inspection
primitive workflows runs list <workflow-id> [--status pending|running|completed|failed]
primitive workflows runs status <workflow-id> <run-id>
primitive workflows runs steps <workflow-id> <run-id>
primitive workflows runs step-detail <workflow-id> <run-id> <step-id>
primitive workflows runs error <workflow-id> <run-id>
primitive workflows runs failures <workflow-id>

# Test cases
primitive workflows tests list <workflow-id>
primitive workflows tests create <workflow-id> --name "Basic" --vars '{"x":1}' --contains '["expected"]'
primitive workflows tests run <workflow-id> <test-case-id>
primitive workflows tests run-all <workflow-id>

# Analytics (CLI-side)
primitive workflows analytics overview --days 7
primitive workflows analytics top --days 7
```

All inspection commands take `--json`.

### Reusable step fragments

A workflow TOML can pull shared `[[steps]]` blocks out of fragment files via `include`:

```toml
# config/workflows/onboard.toml
[workflow]
key = "onboard"
name = "Onboard new user"
status = "active"

include = ["common-validation", "common-audit"]

[[steps]]
id = "create-account"
kind = "database.mutate"
# ...
```

Fragments live at `<workflowDir>/../workflow-fragments/<name>.toml` and contain only `[[steps]]` tables (no `[workflow]` block, no further `include`). The CLI expands `include` references before `sync push` — the server only ever stores the flattened step list. Step ids must be unique across the expanded set; collisions are reported with both source locations. Use `primitive workflows expand <file>` to print the expanded result.

### Operation `$params` validation

When a workflow references a registered database operation via `database.query`/`mutate`/etc., the CLI checks that every `$params.X` substitution in the operation's TOML maps to a declared `[[operations.params]]` entry at `sync push` time. A typo like `$params.proectId` is reported with the file path and line number of the offending `[[operations]]` block instead of silently no-opping at runtime.

## Client SDK

Start a workflow, check its status, and list recent runs:

```typescript
  // Start a workflow; it runs in the background
  const { runId, runKey } = await client.workflows.start({
    workflowKey: "welcome-email",
    input: { userName: "Alice", userEmail: "alice@example.com" },
  });

  // Check status
  const status = await client.workflows.getStatus({ workflowKey: "welcome-email", runKey });

  // List recent runs
  const { items } = await client.workflows.listRuns({ workflowKey: "welcome-email", limit: 50 });
```

Full options and result shapes for these calls:

```typescript
  const result = await client.workflows.start({
    workflowKey: "my-workflow",
    input: { text: "hello" }, // optional, default {}
    runKey: "order-1234", // optional, idempotency key — auto-generated otherwise
    contextDocId: "doc-id", // optional
    meta: { source: "api" }, // optional, max 1KB
    forceRerun: false, // optional — terminate existing run with same key
  });
  // → { runId, runKey, instanceId, status, existing? }

  const status = await client.workflows.getStatus({
    workflowKey: "my-workflow",
    runKey: result.runKey,
    contextDocId: "doc-id", // optional, must match the start call's scope
  });
  // → { status, output?, error?, run? }
  // status.status: "running" | "complete" | "failed" | "terminated" |
  //                "apply_pending" | "apply_claimed"
  // (NOTE: "complete", not "completed", in this method)

  await client.workflows.terminate({
    workflowKey: "my-workflow",
    runKey: result.runKey,
    contextDocId: "doc-id",
  });

  const { items, cursor } = await client.workflows.listRuns({
    workflowKey: "my-workflow",
    status: "complete",
    limit: 50,
  });
```

Inspect the per-step debug records of a run:

```typescript
  // Fetch the per-step run records for a run (debugging / admin views)
  const { items: stepRuns } = await client.workflows.listStepRuns({ runId });

  for (const step of stepRuns) {
    // step.stepId, step.stepKind, step.status, step.input, step.output, step.error
    console.log(step.stepId, step.stepKind, step.status);
  }
```

The step records carry `{ stepRunId, runId, stepKind, status, input, output, error, startedAt, endedAt, ... }`.

`runKey` is scoped as `${contextDocId}#${runKey}`. Calling `start` with an existing `runKey` returns `{ existing: true, ... }` unless `forceRerun: true`.

## WebSocket events

Requires an active WebSocket (e.g., from `client.documents.open(docId)`).

```typescript
  client.on("workflowStarted", (e) => {
    // { workflowKey, runId, runKey, instanceId, contextDocId?, meta? }
  });

  client.on("workflowStatus", (e) => {
    // e.status: "completed" | "failed" | "terminated"
    //   (NOTE: "completed" here, with the "d" — getStatus returns "complete")
    // e.needsApply: true if requiresClientApply and not yet applied
  });
```

The `workflowStatus` event uses `"completed"`. The `getStatus` method returns `"complete"`. These differ in the SDK — handle both if your code shares logic.


## Apply pattern

For workflows with `requiresClientApply = true`, register an apply handler so a client deterministically runs follow-up logic exactly once.

```typescript
  client.workflows.define("my-workflow-key", {
    onApply: async ({ output, workflowKey, runKey, runId, contextDocId, startedByUserId, meta }) => {
      // Runs on exactly one connected client.
      if (!contextDocId) return;
      const { doc } = await client.documents.open(contextDocId);
      doc?.getMap("data").set("result", output);
    },
  });
```

Register `define(...)` before `start(...)` so the apply can't arrive before the handler is in place.


Manual flow if you need it: `claimApply` → run logic → `confirmApply` (success) or `releaseApply` (failure). 30s lease timeout for crashed clients.

## Footguns and don't-do-this

### Wrong: trying to use `{{ }}` in `runIf`

```toml novalidate
# WRONG — runIf is CEL, not a template
runIf = "{{ steps.check.isMember }}"

# RIGHT
runIf = "steps.check.isMember"
```

### Wrong: stuffing secrets into step config

```toml novalidate
# WRONG — step config is logged to step run records
[steps.request.headers]
Authorization = "Bearer {{ secrets.API_KEY }}"

# RIGHT — put secrets in the integration's defaultHeaders/staticQuery
# (configured once on the integration, never appears in step output)
```

### Wrong: assuming `meta.startedAt` exists

```toml novalidate
# WRONG — meta only has whatever you passed to start()
filename = "{{ meta.startedAt }}.pdf"

# RIGHT — use a built-in helper, or pass timestamps in via meta
filename = "{{ now }}.pdf"
```

### Wrong: re-running an idempotent step inside a retry loop

`continueOnError = true` does not retry — it captures the error and moves on. To retry, the workflow has to re-invoke the step explicitly (e.g., another workflow run, or a `forEach` fan-out that re-dispatches failed items). The engine already retries transient errors per step automatically; don't add a second layer.

### Wrong: leaking secrets/PII via `saveAs`

```toml
# WRONG — saveAs result is persisted in step_run records
[[steps]]
id = "fetch-secrets"
kind = "database.query"
saveAs = "creds"
# operationName returns rows with API keys
```

If a step output contains sensitive data, do NOT `saveAs`. Pipe it directly into the next step via `steps.<id>.field` and immediately overwrite/transform it down to non-sensitive fields.

### Wrong: cron triggers that overlap when work isn't idempotent

```toml
# Default overlapPolicy = "skip" → if the previous run is still running, the next firing is dropped.
# Set "allow" only when each firing is independent and idempotent. There is no "queue" policy.
```

### Wrong: forgetting `requiresClientApply = false` for server-only workflows

Cron-triggered workflows almost always want `requiresClientApply = false`. Otherwise the run sits in `apply_pending` forever because no client is listening.

```bash
primitive workflows update <workflow-id> --requires-client-apply false
```

### Wrong: assuming `email.send` accepts an array `to`

```toml
# WRONG
to = ["a@x.com", "b@x.com"]

# RIGHT — fan out with forEach
[[steps]]
kind = "email.send"
forEach = "{{ input.recipients }}"
as = "addr"
to = "{{ addr }}"
templateType = "..."
```

### Wrong: `workflow.call` thinking the child sees parent state

The child gets ONLY its `[steps.input]` table as `input`. It does not inherit `steps`, `outputs`, `meta`, or `selected`. Pass everything the child needs explicitly.

### Wrong: arbitrary analytics query types

Use the dotted form. `top-users` → `users.top`. `events-grouped` → `events.grouped`. `workflows` → `workflows.top`.

### Wrong: mirroring workflow state into a separate database row

```toml
# WRONG — patching an `importJobs` row at the end of the workflow to track status
[[steps]]
id = "mark-done"
kind = "database.mutate"
operationName = "patch-import-job"
[steps.params]
id = "{{ input.jobId }}"
data = '{ "status": "ready_to_review" }'
```

This drifts the moment the workflow ends without your mutate firing — async failure, terminated run, an upstream step that throws between the data write and the status patch. The row sticks on `"processing"` forever and your UI spins indefinitely.

The workflow engine already tracks status (`running` / `apply_pending` / `apply_claimed` / `complete` / `failed` / `terminated`). Use the workflow's own machinery instead of mirroring it:

- **`meta` (≤1KB)** passed to `workflows.start()` for small client-display fields that need to ride alongside the run (filenames, blob IDs, source labels). Surfaces in `listRuns`, `getStatus`, and `workflowStarted` / `workflowStatus` events.
- **Run `output`** (via a final `transform` step with `saveAs = "output"`) for parsed results. Read via `getStatus({ workflowKey, runKey })`.
- **`requiresClientApply = true`** when you need a "ready for user action" stage before finalization — the run sits in `apply_pending`, the client `claimApply`s it, runs whatever it needs locally, then `confirmApply`s. The run's status now encodes the full pipeline including "user has applied this".

Only persist a separate database row when you need durable history beyond the workflow's 45-day TTL — and even then, store a *result record*, not a status mirror.

## Limits / TTLs

- Workflow runs: cleaned up after **45 days** (preview runs: **7 days**).
- `forEach`: 200 items default, override with `maxItems`.
- `collect`: 10 pages / 10000 items default.
- `analytics.query`: 50 queries per run.
- `analytics.write`: 25 events per step.
- `workflow.call`: max depth 10; circular calls throw.
- Cron triggers: 50 per app.
- `meta` payload: 1KB.
- App secrets via templates/CEL: read-only, available as `secrets.KEY`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `404 WORKFLOW_NOT_FOUND` on start/run-sync | No workflow with that key in this app context |
| `409 WORKFLOW_NOT_ACTIVE` ("Workflow '<key>' is not active") | The workflow exists but its status is draft/archived — activate it with `status = "active"` |
| `400 WORKFLOW_NO_ACTIVE_CONFIG` | Active status but no active config/revision — run `primitive sync push` |
| `Cannot activate workflow without a configuration` | Push steps before activating |
| `Workflow has no draft or configuration to preview` | First `primitive sync push` to create a config, or use `primitive workflows draft update` |
| Run stuck in `apply_pending` | `requiresClientApply = true` but no client running `define()` for that key. Set to `false` for server-only workflows. |
| `existing: true` on `start()` | A run with the same `(contextDocId, runKey)` already exists. Use a different `runKey` or `forceRerun: true`. |
| `Step "X": required field "Y" is empty` | A template expression resolved to `""`. Check the path; consider `strict = true` to surface earlier. |
| `runIf expression failed` | CEL syntax error or unknown identifier in `runIf`. Don't use `{{ }}` inside. |
