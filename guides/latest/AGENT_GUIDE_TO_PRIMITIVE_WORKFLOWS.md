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
`perUserMaxRunning`, `perUserMaxQueued`, `perAppMaxRunning` (default 25), `perAppMaxQueued` (default 10000), `queueTtlSeconds` (default 43200), `dequeueOrder`, `accessRule`, `inputSchema`, `outputSchema`, `requiresClientApply` (default `true` — see "Client apply" below). Sync currently pushes everything except `perAppMax*`, `queueTtlSeconds`, and `requiresClientApply`; set those via `primitive workflows update` if you need non-defaults.

### Per-step common fields

All steps support these in addition to their own:

| Field | Purpose |
|---|---|
| `id` (req) | Unique within the workflow |
| `kind` (req) | Step type — see list below |
| `runIf` | CEL expression; skip step if false |
| `selector` | Override `selected` context (`{ source = "step", stepId = "..." }` or `{ source = "context", path = "outputs.x" }`) |
| `saveAs` | Also store output under `outputs[saveAs]` |
| `forEach` | Iterate over a list expression (path to array, or to `{items: [...]}`) |
| `as` | Loop variable name (default exposes `selected`) |
| `maxItems` | forEach cap (default 200) |
| `continueOnError` | Capture errors as `{ error, errorDetails }` instead of failing the workflow |
| `strict` | Throw if any template expression in this step is unresolved |

## Step types

Every kind below is registered in `src/workflows/runner/default-registry.ts`. If a kind isn't listed here, it doesn't exist.

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

### `delay`

```toml
[[steps]]
id = "wait"
kind = "delay"
ms = 5000               # number, or "5 seconds" / "200ms"
```

### `event.wait`

Suspends the workflow until a matching event arrives via the Cloudflare Workflow `sendEvent` API.

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
# Output: { results: [{ ok, id }] }

[[steps]]
id = "mark-overdue"
kind = "database.applyToQuery"
databaseId = "{{ input.tasksDbId }}"
operationName = "mark-overdue"      # NOTE: uses `operationName`, not `operation`
[steps.params]
now = "2026-04-27T00:00:00Z"
# Output: { matched, updated, truncated? }
```

There is **no `database.executeBatch` step kind.** Batch writes from a workflow are done with `forEach` over a `database.mutate` step, or by calling `database.applyToQuery` for query-driven updates.

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

Group operations evaluate the group type's CEL rules. For workflow-issued operations, rules can match `fromWorkflow("workflowKey")`.

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

### `workflow.start` + `workflow.await`

Fan-out: start child workflows in parallel, then wait. Use with `forEach`.

```toml
[[steps]]
id = "start-all"
kind = "workflow.start"
forEach = "steps.get-users.data"
as = "user"
workflowKey = "process-item"
[steps.input]
userId = "{{ user.id }}"

[[steps]]
id = "results"
kind = "workflow.await"
runs = "steps.start-all"        # path to forEach output ({items: [...]} accepted)
timeout = 600000                # ms, default 600000 (10 min)
onPartialFailure = "fail"       # fail (default) | continue
# Output: { completed: [...], failed: [...], allSucceeded }
```

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

`to` is a single address (string), not an array. Built-in templates: `magic-link`, `otp`, `document-share`, `waitlist-invite`, `waitlist-signup-notification`, `admin-invite`, `app-invite`, `access-request-created`, `access-request-resolved`. Register custom types with `primitive email-templates set <type>`. Per-app hourly rate limit applies.

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
expiresInSeconds = 3600           # 30..86400
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

## `runIf` (CEL, not templates)

```toml
runIf = "input.shouldRun"                        # truthy
runIf = "outputs.text.length < 1000"             # comparison
runIf = "steps.check.isMember && input.amount > 0"
```

CEL context: `input`, `selected`, `steps`, `outputs`, `meta`, `secrets`, plus `iteration` (and `as`-var) inside `forEach`. **Do NOT wrap in `{{ }}`** — `runIf` parses CEL directly. A CEL evaluation error fails the step (or is captured by `continueOnError`).

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

Output is always `{ items: [...per-iter results], errors: [{index, error}], totalSucceeded, totalFailed }` — even when there are no errors. Iterations are sequential. For parallelism, use `workflow.start` + `workflow.await`.

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

Per-step retries are handled by Cloudflare's `step.do()` and are not configurable from TOML. Mark errors non-retryable by ensuring upstream calls return 4xx (the engine wraps 4xx≠429 as non-retryable).

## Output contract

After all steps run:

- `steps[id]` holds every step's output (including skipped/failed entries).
- `outputs[saveAs]` holds outputs for steps with `saveAs`.
- The workflow's final result is `outputs.output` if any step used `saveAs = "output"`, otherwise the full `outputs` map.

**Best practice**: end with a `transform` step using `saveAs = "output"` that explicitly shapes the return value.

## Access control

`accessRule` is a CEL expression. Evaluated when:
- A client calls `workflows.start()`.
- A `workflow.call` step invokes the workflow from another workflow.

NOT evaluated for inbound webhook triggers (those handle their own auth — e.g., Stripe signature). For webhook-triggered workflows, set `accessRule = "hasRole('owner')"` to prevent direct client invocation.

Behavior:
- No rule → any authenticated app member can start.
- `admin`/`owner` always bypass.
- Otherwise, evaluate against `user.userId`, `user.role`, plus `hasRole(role)`, `isMemberOf(groupType, groupId)`, `memberGroups(groupType)`.

## Client apply (footgun)

By default, `requiresClientApply = true`. After the workflow completes, status becomes `apply_pending` and a connected client must call `claimApply` → run `onApply` → `confirmApply` to finalize. If no client is listening, the run sits in `apply_pending` indefinitely.

For server-only workflows (no client follow-up), set `requiresClientApply = false`:

```bash
primitive workflows create --from-file workflow.toml --requires-client-apply false
# or:
primitive workflows update <workflow-id> --requires-client-apply false
```

`primitive sync push` does NOT push this flag — set it via the create/update commands.

## Workflow lifecycle

A workflow needs `status = "active"` AND one of (active configuration | published revision) before clients can run it.

| Status | Active config/revision? | Client can run? | CLI preview? |
|---|---|---|---|
| `draft` | either | no | yes |
| `active` | yes (required) | yes | yes |
| `archived` | – | no | no |

Setting `status = "active"` without an active config or revision returns: `Cannot activate workflow without a revision or active configuration`.

`primitive sync push` creates a default configuration automatically when a workflow is first created and updates it on subsequent pushes. Each push of `[[steps]]` updates the active configuration's steps in place.

### Configurations vs revisions

- **Configurations** (recommended): named, mutable groupings of steps. One is `activeConfigId`. Created automatically on first sync push.
- **Revisions** (legacy): immutable snapshots created via `primitive workflows publish`.

## CLI

```bash
# Sync (recommended for everything)
primitive sync init --dir ./config
primitive sync pull --dir ./config
primitive sync diff --dir ./config
primitive sync push --dir ./config --dry-run
primitive sync push --dir ./config

# Workflow CRUD (when not using sync)
primitive workflows list [--status active] [--json]
primitive workflows get <workflow-id>
primitive workflows create --from-file workflow.toml [--requires-client-apply false]
primitive workflows update <workflow-id> --status active
primitive workflows delete <workflow-id>           # archive
primitive workflows delete <workflow-id> --hard --yes

# Preview a workflow
primitive workflows preview <workflow-id> --input '{"x":1}' --wait
primitive workflows preview <workflow-id> --config <config-id> --wait
primitive workflows preview <workflow-id> --draft --wait
# Preview source priority:
#   1. --config <id> if provided
#   2. --draft if flag set
#   3. active configuration (default)
#   4. draft (fallback if no active config)

# Draft / publish (legacy revision flow)
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
primitive workflows runs list <workflow-id> [--status running|completed|failed]
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

### Cron triggers

```bash
primitive cron-triggers create \
  --key nightly-digest \
  --name "Nightly Digest" \
  --cron "0 9 * * *" \
  --workflow-key send-digest \
  --timezone "America/Los_Angeles" \
  --overlap-policy skip       # skip (default) | allow

primitive cron-triggers list
primitive cron-triggers get <trigger-id>
primitive cron-triggers test <trigger-id>     # fire manually
primitive cron-triggers pause <trigger-id>
primitive cron-triggers resume <trigger-id>
primitive cron-triggers delete <trigger-id>
```

Notes:
- The CLI flags are `--key`, `--name`, `--cron`, `--workflow-key`, `--overlap-policy`, `--timezone` — NOT `--schedule` or `--workflow`.
- `overlapPolicy` is exactly `skip` or `allow` (no `queue` value exists).
- Per-app cap of 50 cron triggers.
- Always set an IANA `--timezone` for user-visible schedules.
- The referenced workflow must be `status = "active"` with an active config/revision and (for server-only triggers) `requiresClientApply = false`.

See `AGENT_GUIDE_TO_PRIMITIVE_SCHEDULING_AND_REALTIME.md` for full details.

## Client SDK

```typescript
const result = await client.workflows.start({
  workflowKey: "my-workflow",
  input: { text: "hello" },        // optional, default {}
  runKey: "...",                    // optional, idempotency key — auto-generated otherwise
  contextDocId: "doc-id",           // optional
  meta: { source: "api" },          // optional, max 1KB
  forceRerun: false,                // optional — terminate existing run with same key
});
// → { runId, runKey, instanceId, status, existing? }

const status = await client.workflows.getStatus({
  workflowKey: "my-workflow",
  runKey: result.runKey,
  contextDocId: "doc-id",           // optional, must match the start call's scope
});
// → { status, output?, error?, run? }
// status.status: "running" | "complete" | "failed" | "terminated" | "apply_pending" | "apply_claimed"
// (NOTE: "complete", not "completed", in this method)

await client.workflows.terminate({ workflowKey, runKey, contextDocId });
const { items, cursor } = await client.workflows.listRuns({ workflowKey, status, limit: 50 });

// Step debug data
const { items: stepRuns } = await client.workflows.listStepRuns({ runId });
// → [{ stepRunId, runId, kind, status, input, output, error, startedAt, finishedAt, ... }]
```

`runKey` is scoped as `${contextDocId}#${runKey}`. Calling `start` with an existing `runKey` returns `{ existing: true, ... }` unless `forceRerun: true`.

## WebSocket events

Requires an active WebSocket (e.g., from `client.documents.open(docId)`).

```typescript
client.on("workflowStarted", (e) => { /* { workflowKey, runId, runKey, instanceId, contextDocId?, meta? } */ });

client.on("workflowStatus", (e) => {
  // e.status: "completed" | "failed" | "terminated"  (NOTE: "completed" here, with the "d")
  // e.needsApply: true if requiresClientApply and not yet applied
});
```

The `workflowStatus` event uses `"completed"`. The `getStatus` method returns `"complete"`. Yes, this is inconsistent in the SDK — handle both if your code shares logic.

## Apply pattern

For workflows with `requiresClientApply = true`, register an apply handler so a client deterministically runs follow-up logic exactly once.

```typescript
client.workflows.define("my-workflow-key", {
  onApply: async ({ output, workflowKey, runKey, runId, contextDocId, startedByUserId, meta }) => {
    // Runs on exactly one connected client.
    const { doc } = await client.documents.open(contextDocId);
    doc.getMap("data").set("result", output);
  },
});
```

Manual flow if you need it: `claimApply` → run logic → `confirmApply` (success) or `releaseApply` (failure). 30s lease timeout for crashed clients.

## Footguns and don't-do-this

### Wrong: trying to use `{{ }}` in `runIf`

```toml
# WRONG — runIf is CEL, not a template
runIf = "{{ steps.check.isMember }}"

# RIGHT
runIf = "steps.check.isMember"
```

### Wrong: stuffing secrets into step config

```toml
# WRONG — step config is logged to step run records
[steps.request.headers]
Authorization = "Bearer {{ secrets.API_KEY }}"

# RIGHT — put secrets in the integration's defaultHeaders/staticQuery
# (configured once on the integration, never appears in step output)
```

### Wrong: assuming `meta.startedAt` exists

```toml
# WRONG — meta only has whatever you passed to start()
filename = "{{ meta.startedAt }}.pdf"

# RIGHT — use a filter, or pass it in via meta
filename = "{{ '' | now }}.pdf"
```

### Wrong: re-running an idempotent step inside a retry loop

`continueOnError = true` does not retry — it captures the error and moves on. To retry, the workflow has to re-invoke the step explicitly (e.g., another workflow run, or a `workflow.start` fan-out with retries). Cloudflare's `step.do()` already retries on transient errors automatically; don't add a second layer.

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

### Wrong: `database.executeBatch` step

Doesn't exist. Use `forEach` over a `database.mutate` step, or use `database.applyToQuery` for query-driven updates.

### Wrong: arbitrary analytics query types

Use the dotted form. `top-users` → `users.top`. `events-grouped` → `events.grouped`. `workflows` → `workflows.top`.

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
| `Workflow not found` | Wrong app context, or `status != "active"`, or no active config/revision |
| `Cannot activate workflow without a revision or active configuration` | Push steps before activating |
| `Workflow has no draft or configuration to preview` | First `primitive sync push` to create a config, or use `primitive workflows draft update` |
| Run stuck in `apply_pending` | `requiresClientApply = true` but no client running `define()` for that key. Set to `false` for server-only workflows. |
| `existing: true` on `start()` | A run with the same `(contextDocId, runKey)` already exists. Use a different `runKey` or `forceRerun: true`. |
| `Step "X": required field "Y" is empty` | A template expression resolved to `""`. Check the path; consider `strict = true` to surface earlier. |
| `runIf expression failed` | CEL syntax error or unknown identifier in `runIf`. Don't use `{{ }}` inside. |
