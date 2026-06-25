# Workflows

A **workflow** is a multi-step automation pipeline that runs on the server. Chain together LLM calls, data transformations, external API requests, delays, and conditional logic — all defined as version-controlled TOML config. Primitive executes the steps in sequence, persists every step's input and output, and surfaces the run's status to your app, the CLI, and the Admin Console. The same workflow can be invoked from your app, on a schedule, or by an inbound webhook — the definition doesn't care who triggered it.

## Defining a Workflow

```toml
# config/workflows/welcome-email.toml
[workflow]
key = "welcome-email"
name = "Welcome Email Workflow"
status = "active"

[[steps]]
id = "generate-message"
kind = "llm.chat"
model = "gpt-4o-mini"
temperature = 0.7
saveAs = "message"

[[steps.messages]]
role = "system"
content = "You write friendly, concise welcome emails."

[[steps.messages]]
role = "user"
content = "Write a welcome email for {{ input.userName }}."

[[steps]]
id = "send-email"
kind = "email.send"
to = "{{ input.userEmail }}"
subject = "Welcome!"
htmlBody = "{{ steps.generate-message.content }}"
```

Push it to the server:

```bash
primitive sync push
```

`sync push` creates and updates the workflow's active configuration in place. Once `status = "active"`, the workflow can be invoked.

## Steps

A workflow is a sequence of **steps**. Each step has an `id` (unique within the workflow) and a `kind` — what the step does — plus whatever configuration that kind needs. Steps run in order, and every step's output is recorded on the run and available to the steps after it.

A few kinds you'll reach for constantly:

| Kind | Purpose |
|---|---|
| `transform` | Shape a value with the templated `output` field — typically the workflow's final result |
| `llm.chat` / `prompt.execute` | LLM chat completion, or run a [managed prompt](./prompts.md) |
| `integration.call` | Call an external API via a configured integration |
| `database.query` / `database.mutate` | Run registered database operations |
| `email.send` | Send an email |

The full catalog — branching, delays, fan-out to child workflows, blob and analytics steps, and more — is in the [Step Reference](#step-reference) at the end of this page.

## How Data Flows Through a Run

A run carries a single growing JSON context from the first step to the last:

1. **Every run starts with one JSON object — the input.** It's the `input` passed to `start()` or `runSync()`, a webhook's (mapped) payload, or a cron trigger's configured input. If the workflow declares an `inputSchema`, the input is validated against it first.

2. **Steps read from the context through templates.** A step has no implicit input argument. Just before it runs, the <span v-pre>`{{ ... }}`</span> expressions in its config strings are resolved against the run context — `input.*` plus the recorded output of every step that already ran — and the step executes with that filled-in config. An email step's <span v-pre>`to = "{{ input.userEmail }}"`</span> and an LLM message's <span v-pre>`content = "Summarize: {{ steps.fetch.body }}"`</span> are both reading the context this way.

3. **Every step's output is recorded.** Whatever a step produces (always JSON) is stored on the run as `steps.<id>`. Give the step `saveAs = "name"` and the same value is also available as `outputs.name` — a stable alias later steps can use without depending on the step's id. The engine also stamps each entry with a verdict — `ok`, plus `skipped` or `errored` when relevant — that later steps can branch on.

4. **The run's final output.** When the last step finishes, the workflow's result is `outputs.output` — the value saved by a step with `saveAs = "output"` — or the whole `outputs` map if no step used that name. The standard pattern is to end with a `transform` step that sets `saveAs = "output"` and explicitly shapes the return value. The full step-by-step record (each step's input and output) stays on the run for inspection.

Template syntax, filters, and built-in helpers are covered in the [Template Reference](#template-reference) at the end of this page.

## Conditional Execution

Skip a step when a CEL expression evaluates falsy. `runIf` is parsed as CEL directly — do **not** wrap it in <span v-pre>`{{ }}`</span>:

```toml
[[steps]]
id = "premium-feature"
kind = "llm.chat"
runIf = "input.isPremium && steps.lookup.ok"
model = "gpt-4o-mini"

[[steps.messages]]
role = "user"
content = "Generate premium content for {{ input.topic }}."
```

Every step output carries an engine-managed `ok` boolean (and `skipped: true` when `runIf` was falsy, `errored: true` when captured by `continueOnError`), so downstream `runIf` expressions can branch reliably on `steps.<id>.ok` or `!steps.<id>.skipped`.

CEL optional types are enabled in every workflow context, so you can collapse multi-conjunct null guards: `steps.fetch.?data.?items.orValue([]).size() > 0`.

## The Run Lifecycle

Every invocation creates a persistent **workflow run**. A run moves through `queued` → `running` → a terminal state (`completed`, `failed`, or `terminated`). Workflows that apply their results into local-first documents add two more states — `apply_pending` and `apply_claimed` — between the last step and completion (see [Applying Results to Local Data](#applying-results-to-local-data-client-apply)).

Each step's input and output is recorded on the run, so you can always reconstruct what happened — from the CLI, from your app, or in the Admin Console's run detail view. Runs look the same whether a user, a cron trigger, or a webhook started them.

## Invoking Workflows

Four ways to start a run, all hitting the same workflow definition:

| Invocation | Use for |
|---|---|
| **Client call (async)** | User-initiated jobs your UI tracks: imports, report generation, enrichment |
| **Client call (sync)** | Short, latency-sensitive calls: validation, lookups, webhook-style responses |
| **Cron trigger** | Anything on a clock: digests, cleanup, periodic syncs |
| **Inbound webhook** | External services pushing events: Stripe, GitHub, Slack |

Client invocations are gated by the workflow's access rule — see [Controlling Access to Workflows](#controlling-access-to-workflows) below.

### From Your App (Asynchronous)

Start a run, then track it by polling or by listening for status events:

::: code-group

<<< ../../examples/workflows/workflow-start.ts#example{ts} [JavaScript]

<<< ../../examples/workflows/workflow-start.swift#example{swift} [Swift]

:::

`getStatus` returns `status` and, when complete, `output`. For live updates without polling, subscribe to status events:

::: code-group

```typescript [JavaScript]
client.on("workflowStatus", (event) => {
  if (event.status === "completed") console.log("Result:", event.output);
});
```

```swift [Swift]
let sub = client.events.on(.workflowStatus) { (event: WorkflowStatusEvent) in
  if event.status == "completed" { print("Result:", event.output ?? "") }
}
```

:::

### From Your App (Synchronous)

For short, latency-sensitive workflows, opt the workflow into synchronous invocation by setting `syncCallable = true` in the workflow TOML or via `primitive workflows update --sync-callable true`. Clients can then `await` the final result in one round-trip:

::: code-group

<<< ../../examples/workflows/workflow-run-sync.ts#example{ts} [JavaScript]

<<< ../../examples/workflows/workflow-run-sync.swift#example{swift} [Swift]

:::

The promise resolves for every terminal outcome; only network errors reject. Long-running workflows should use asynchronous `start()` instead.

### Applying Results to Local Data (Client Apply)

A workflow runs on the server, but its result often belongs in a **document** — local-first data only clients write. Set `requiresClientApply = true` on the workflow and the run doesn't finish at the last step: it transitions to `apply_pending`, and a connected client claims it, writes the output into the document, and confirms:

1. The client registers an apply handler for the workflow with `workflows.define(workflowKey, { onApply })`.
2. When a run reaches `apply_pending`, a client calls `claimApply()` (an exclusive, time-limited claim), runs the handler, then `confirmApply()` — or `releaseApply()` on failure so another client can retry.
3. `define(...)` wraps this loop for you — when the status event arrives, the client claims the lease, runs your handler, and confirms (or releases on a thrown error). Most apps never call claim/confirm directly.

If a workflow's output doesn't need to land in a document — it writes to databases, sends email, returns a value — leave `requiresClientApply` off. Server-only workflows (cron-fired jobs especially) should set it to `false` explicitly, otherwise runs sit in `apply_pending` waiting for a client that never comes:

```bash
primitive workflows update <workflow-id> --requires-client-apply false
```

### On a Schedule (Cron Triggers)

A cron trigger fires a workflow on a schedule. Create one via the CLI, or as TOML synced with the rest of your config:

::: code-group

```bash [CLI]
primitive cron-triggers create \
  --key nightly-digest \
  --name "Nightly Digest" \
  --workflow-key send-digest \
  --cron "0 9 * * *" \
  --timezone "America/Los_Angeles" \
  --overlap-policy skip
```

```toml [TOML (config/cron-triggers/nightly-digest.toml)]
[cronTrigger]
key = "nightly-digest"
displayName = "Nightly digest email"
workflowKey = "send-digest"
cron = "0 9 * * *"
timezone = "America/Los_Angeles"
overlapPolicy = "skip"

[rootInput]
digestType = "daily"
```

:::

`[rootInput]` is a literal JSON payload sent on every firing (the CLI flag is `--input`); use `inputMapping` (`--input-mapping`) instead to project values from the firing context (e.g. `runId = "$triggerId"`, `at = "$firedAt"`).

**Schedules** are standard 5-field cron (minute, hour, day-of-month, month, day-of-week): `0 * * * *` is hourly, `0 9 * * 1` is Mondays at 9:00, `0 0 1 * *` is the first of the month. **Timezone** accepts any IANA name and handles DST correctly — `0 9 * * *` in `America/Los_Angeles` fires at 9:00 local year-round; omitted means UTC. **Overlap policy** decides what happens if a firing arrives while the previous run is still going: `"skip"` (default — right for idempotent jobs) or `"allow"` (parallel runs).

Manage triggers from the CLI or your app:

```bash
primitive cron-triggers list
primitive cron-triggers get <trigger-id>      # includes recent runs
primitive cron-triggers pause <trigger-id>
primitive cron-triggers resume <trigger-id>
primitive cron-triggers test <trigger-id>     # fire manually
primitive cron-triggers delete <trigger-id>
```

::: code-group

<<< ../../examples/scheduling/cron-manage.ts#example{ts} [JavaScript]

<<< ../../examples/scheduling/cron-manage.swift#example{swift} [Swift]

:::

Two limits: 50 cron triggers per app (consolidate with a single trigger that fans out — `iterate-users`, or a `forEach` over `workflow.call`), and 1-minute minimum granularity.

Cron-fired runs are persistent workflow runs like any other — `meta.triggerId` identifies the trigger that fired them. Remember `requiresClientApply = false` for cron workflows (above).

### Via Inbound Webhooks

Inbound webhooks let external services (Stripe, GitHub, Slack, etc.) trigger workflows automatically. Each webhook has a public URL, signature verification, and automatic workflow triggering. Define them in your sync directory:

```toml
# config/webhooks/stripe-payments.toml
[webhook]
key = "stripe-payments"
displayName = "Stripe Payments"
workflowKey = "handle-payment"
verificationScheme = "stripe"
status = "active"
```

The receive endpoint is `POST /app/{appId}/webhook/{webhookKey}`. When an event arrives, the webhook verifies the signature and starts the configured workflow with the event payload as input. Supported verification schemes are `stripe`, `github`, `slack`, `custom`, and `none`. Use `inputMapping` to extract a nested path from the payload before passing it to the workflow (e.g. `"data.object"`).

**Securing webhook workflows:** add an `accessRule` so clients can't bypass signature verification by starting the workflow directly with a crafted payload:

```toml
[workflow]
key = "handle-payment"
name = "Handle Payment"
status = "active"
accessRule = "hasRole('owner')"  # Only webhook triggers can start this — clients are blocked
```

The `accessRule` is evaluated on `client.workflows.start()` calls but **not** on webhook triggers (which have their own signature verification), so `hasRole('owner')` restricts direct starts while webhooks flow normally.

Inspect webhooks and their recent deliveries (accepted, rejected, duplicate) from the CLI:

```bash
primitive webhooks list                  # shows each webhook's ID
primitive webhooks events <webhook-id>
primitive webhooks rotate-secret <webhook-id>
```

## Controlling Access to Workflows

Every workflow can carry an `accessRule` — a CEL expression in the `[workflow]` block that decides who may start a run:

```toml
[workflow]
key = "generate-report"
name = "Generate Report"
accessRule = "hasRole('admin') || isMemberOf('team', 'ops')"
```

With no rule, any signed-in member of the app can start the workflow; admins and owners always pass regardless of the rule. The rule is evaluated on every client invocation — asynchronous or synchronous — and when another workflow invokes this one through a `workflow.call` step. Cron triggers and inbound webhooks have their own controls and skip it; that's what makes the [webhook lock-down pattern](#via-inbound-webhooks) work.

Push the rule with `primitive sync push` like any other workflow config, or change it in place with `primitive workflows update <id> --access-rule "<CEL>"`. For the rule language and the identity context available to it (`hasRole`, `isMemberOf`, `memberGroups`), see [Access Control](./access-control.md).

## System Workflows

By default a workflow runs **as the user who started it** (`runAs = "caller"`): every step acts with that member's own permissions — it touches only documents they can access, and its group and data operations are checked against their roles. This is the safe default, and most workflows want it.

Set `runAs = "system"` to run a workflow as the **app itself** instead of as any one user:

```toml
[workflow]
key = "nightly-digest"
name = "Nightly Digest"
runAs = "system"
```

A system run executes with the app's own privileges — which is what lets a scheduled job read and write across every user's data. Because it acts on no one's behalf, who may start one is tightly held:

- **Only admins and owners can start a system workflow.** A regular member who tries is refused with a `403` — never silently downgraded to a caller run.
- **Cron triggers and inbound webhooks can only fire system workflows.** A trigger has no human principal to borrow, so it refuses to start a `caller` workflow. (Member-initiated runs are what caller workflows are for.)

Runs are attributed to the app's system principal, and every system run records who set it off — the admin who started it, or the trigger that fired it — for the audit trail.

### Sensitive capabilities

A system run can always read and write the app's documents and data. Anything beyond that baseline is **opt-in**: declare it in `capabilities` so a privileged workflow does only what you intend.

```toml
[workflow]
key = "sync-team-roster"
name = "Sync Team Roster"
runAs = "system"
capabilities = ["membership"]
```

`membership` lets the workflow change group membership — the `group.addMember` and `group.removeMember` steps. Without the grant, those steps in a system workflow are refused. Read-only group checks never need it.

[`iterate-users`](#iterate-users) is system-only — it fans out across the entire user roster, which no single caller has the standing to do. A workflow that uses it must set `runAs = "system"`, or the server rejects it when you push.

### Acting on Behalf of a User

A system run acts as the app, not as any one member — but a per-user job often needs to work *about* a specific user: read the documents they can see, run a database operation under their access rules, or attribute an event to them. The `*ForUser` step variants do exactly that. Each takes an explicit `userId` **subject** and operates as if it were checking that user, while the run's actor stays the system principal for the audit trail — the workflow acts *about* the user, never *as* them.

These steps are **system-only** — a `runAs = "caller"` workflow that calls one is rejected — and the subject must be a member of the app, or the step fails. `userId` can be set on the step or inherited from `input.userId`, so a child workflow fanned out by [`iterate-users`](#iterate-users) gets the iterated user as its subject with no wiring:

```toml
[[steps]]
id = "ensure-profile"
kind = "document.getOrCreateWithAliasForUser"
userId = "{{ input.userId }}"
aliasKey = "profile"
title = "Profile"
# permission = "write"   # the subject's grant on a freshly created doc; default "write"

[[steps]]
id = "assignments"
kind = "database.queryForUser"
userId = "{{ input.userId }}"
databaseId = "{{ input.classroomDbId }}"
operationName = "listAssignments"
saveAs = "assignments"

[[steps]]
id = "track"
kind = "analytics.writeForUser"
userId = "{{ input.userId }}"
action = "profile.processed"
feature = "onboarding"
```

A `database.*ForUser` step evaluates the operation's CEL access rules and database triggers as the **subject** — `user.userId`, `hasRole(...)`, and `isMemberOf(...)` all refer to that user — even though the actor recorded on the run stays the system principal.

The subject-user steps:

| Kind | Returns |
|---|---|
| `user.get` | The subject's profile: `{ userId, email, name, appRole, rootDocId, disabled }` |
| `user.resolve` | Resolve a subject by `userId` or `email`; `{ userId: null }` when no app member matches, else `{ userId, user }` |
| `document.resolveAliasForUser` | Resolve the subject's user-scoped alias (app-privileged); `{ documentId: null }` on miss |
| `document.listForUser` | Documents visible to the subject — direct and root-document grants — as `{ items, cursor }` |
| `document.getForUser` | One document as the subject sees it: `{ document, permission }`, or `{ document: null }` when they have no effective access. Pass `systemBypass = true` for an app-privileged read by id |
| `document.getOrCreateWithAliasForUser` | Ensure a per-subject document exists (created by the system actor, with the alias and a default `write` grant to the subject): `{ documentId, aliasKey, userId, created }` |
| `database.*ForUser` | `queryForUser` / `mutateForUser` / `countForUser` / `aggregateForUser` / `pipelineForUser` / `applyToQueryForUser` — the matching `database.*` step, run under the subject's access rules and trigger context |
| `analytics.writeForUser` | Emit an analytics event attributed to the subject |
| `document.listForGroup` | Documents a group can access — direct grants and those reaching the group through a collection, resolved in one query — as `{ items, cursor }`; each item carries the group's grant level and where it came from. Optionally filter by `permission` |
| `document.listForCollection` | Documents contained in a collection (its membership, not any one user's access) as `{ items, cursor }` |
| `document.getRootForUser` | The subject's root document id, or `null` if they have none. Pass `create = true` to assign one (the subject gets read-write access) |

`document.listForUser` covers the subject's direct and root-document grants; to enumerate documents a group or collection reaches, use `document.listForGroup` or `document.listForCollection`.

Once a subject method hands back a concrete `documentId`, the ordinary `document.query` / `save` / `patch` / `delete` steps read and write it app-privileged — there are no separate `*ForUser` write kinds. Those CRUD steps also accept an inline subject alias, `documentAlias = { scope = "user", aliasKey = "...", userId = "..." }`, which resolves the subject's alias in place and fails the step if it doesn't exist.

## Testing and Debugging Workflows

**Test cases** live alongside the workflow and run against the real engine:

```bash
primitive workflows tests create <workflow-id> --name "Basic test" --vars '{"input":"hello"}'
primitive workflows tests run-all <workflow-id>
```

**Manual firing** for cron-driven workflows: `primitive cron-triggers test <trigger-id>`.

**Run inspection** — every step's input and output is persisted and reachable from the CLI, your app, or the Admin Console's run detail view:

```bash
primitive workflows runs list <workflow-id>
primitive workflows runs status <workflow-id> <run-id>
primitive workflows runs steps <workflow-id> <run-id>
```

::: code-group

<<< ../../examples/workflows/workflow-list-step-runs.ts#example{ts} [JavaScript]

<<< ../../examples/workflows/workflow-list-step-runs.swift#example{swift} [Swift]

:::

## Syncing Workflow Config

```bash
# Initialize config (sync dir auto-resolves to .primitive/sync/<env>/<appId>/)
primitive sync init

# Pull current server config
primitive sync pull

# Edit TOML files locally...

# See what changed
primitive sync diff

# Push changes
primitive sync push
```

When a workflow needs flags `sync push` doesn't carry (`requiresClientApply`, `syncCallable`, queue caps), set them with `primitive workflows update`.

For reusable step blocks, lift them into `<workflowDir>/../workflow-fragments/<name>.toml` and reference them from a workflow via `include = ["<name>"]`. The CLI flattens fragment references before push; `primitive workflows expand <workflow.toml>` prints the expanded result for debugging.

## Step Reference

Every step has an `id` (unique within the workflow) and a `kind` (the step type). The kinds the engine supports, each described below:

| Kind | Purpose |
|---|---|
| `transform` | Shape a value with the templated `output` field — typically used for the workflow's final result |
| `script` | Run a sandboxed, deterministic Rhai script to transform JSON |
| `iterate-users` | Restartable per-user fan-out: run a child workflow once for every app user |
| `switch` | First-match branching across CEL `when` cases |
| `delay` | Pause execution (`ms = 5000` or `"5 seconds"`) |
| `event.wait` | Suspend until an external event with the matching type arrives |
| `llm.chat` | LLM chat completion |
| `gemini.generate` / `gemini.generateRaw` / `gemini.countTokens` | Google Gemini |
| `prompt.execute` | Run a [managed prompt](./prompts.md) |
| `integration.call` | Call an external API via a configured integration |
| `database.query` / `mutate` / `count` / `aggregate` / `pipeline` / `applyToQuery` | Run registered database operations |
| `document.query` / `queryOne` / `count` / `save` / `patch` / `delete` | Read and write records in a document's models |
| `document.resolveAlias` | Resolve a document alias to its id (or null) for conditional branching |
| `group.addMember` / `removeMember` / `checkMembership` / `listMembers` / `listUserMemberships` | Group membership operations |
| `collect` | Auto-paginate any step that returns `{ items, cursor }` |
| `workflow.call` | Run a child workflow synchronously, inline (use `forEach` to fan out) |
| `email.send` | Send an email (template-based or inline) |
| `blob.upload` / `blob.download` / `blob.signedUrl` | Read, write, or sign blob URLs |
| `analytics.write` / `analytics.query` | Emit analytics events or query server-side aggregates |
| `noop` | Return `{ message, payload }`; useful as a placeholder |

System workflows add subject-user variants — `user.get` / `user.resolve`, `document.*ForUser`, `database.*ForUser`, and `analytics.writeForUser` — for acting about a specific user; see [Acting on Behalf of a User](#acting-on-behalf-of-a-user).

Steps that reach across the network — `llm.chat`, `gemini.generate`, the `database.*` steps, and `email.send` — are bounded by a timeout: 120 seconds for the LLM and Gemini steps, 30 seconds for database and email. Override it per step with a `timeout` field (in milliseconds). A step that exceeds its timeout fails without retrying, recording a failed step-run rather than hanging the run.

### `transform`

Returns its templated `output` table — the workhorse for shaping a final result or restructuring data between steps. Given run input `{ "name": "Ada" }` and a prior step `fetch` whose output is `{ "items": ["alpha", "beta"] }`:

```toml
[[steps]]
id = "final"
kind = "transform"
saveAs = "output"
[steps.output]
greeting = "Hello {{ input.name }}"
items = "{{ steps.fetch.items }}"     # single-expression mode preserves arrays
```

The step's result is the templated table itself — `steps.final` (and `outputs.output`, via `saveAs`) becomes:

```json
{ "greeting": "Hello Ada", "items": ["alpha", "beta"] }
```

### `script`

For data shaping that's more involved than a templated `transform` step — reshaping nested JSON, computing derived fields, filtering and mapping arrays — a `script` step runs a sandboxed [Rhai](https://rhai.rs/) script over its JSON input and returns JSON. Scripts are **deterministic and side-effect-free** (no network, no clock, no storage), so they're safe to retry and easy to test.

A script body lives in your sync directory as `transforms/<name>.rhai` and is pushed with `primitive sync push`:

```
// transforms/normalize-order.rhai
let items = input.raw.items.filter(|i| i.qty > 0);
let total = 0.0;
for i in items { total += i.qty * i.price; }
#{
  currency: input.currency,
  itemCount: items.len(),
  total: total,
}
```

The step names the script with `ref` and feeds it input through the `with` table — inside the script, `with` is read as `input.*` (not bare variables):

```toml
[[steps]]
id = "normalize"
kind = "script"
ref = "normalize-order"     # the script's name: transforms/normalize-order.rhai
saveAs = "order"
# configId = "..."          # optional — pin a specific ScriptConfig for determinism
[steps.with]
raw = "{{ steps.fetch.body }}"
currency = "{{ input.currency }}"
```

`configId` is optional. Without it, the runner resolves the script's active config body at execution time, so pushing a new `.rhai` body reaches all referencing workflows on their next run with no re-publish step. Set `configId` to pin a specific version when determinism is required.

`limits` is also optional and lowers the per-run sandbox ceilings for this step (`maxOperations`, `wallMsHint`, `maxOutputBytes`, `maxArrayLength`, `maxObjectKeys`, `maxNestingDepth`, `maxStringSize`, `maxCallDepth`, `maxLogBytes`). Requested values are clamped at the app ceiling; they can only lower, never raise it.

Given `steps.fetch.body` of `{ "items": [ { "sku": "a1", "qty": 2, "price": 5.0 }, { "sku": "b2", "qty": 0, "price": 9.0 } ] }` and input `{ "currency": "USD" }`, the script returns:

```json
{ "currency": "USD", "itemCount": 1, "total": 10.0 }
```

One wiring detail: a script's return value lands under `steps.<id>.output.*` — later steps read <span v-pre>`{{ steps.normalize.output.total }}`</span>, not <span v-pre>`{{ steps.normalize.total }}`</span> (unlike `transform`, whose result is the table directly).

Pushing a changed `.rhai` file (`primitive sync push`) creates a new script version and activates it — every workflow that references the script by name picks up the new body on its next run, with no re-publish step needed.

### `iterate-users`

Fans another workflow out across **every user in the app**, once per user, as a restartable singleton — built for big per-user batch jobs (backfills, digests) that must survive restarts without re-processing completed users. It's a [system-only](#system-workflows) step: the workflow must set `runAs = "system"`.

```toml
[[steps]]
id = "backfill"
kind = "iterate-users"
iterationName = "2026-06-prefs-backfill"   # stable name; identifies this iteration
pageSize = 100
concurrency = 25
[steps.source]
mode = "app"                 # iterate the app's user roster
[steps.perUser]
workflowKey = "process-one-user"   # the workflow to run once per user
[steps.perUser.input]
reason = "preferences backfill"    # static input merged into each child run
```

`source` selects which users to iterate — `mode = "app"` walks the app's full user roster, fetched in pages of `pageSize`. For each user, the step starts a child run of the workflow named by `perUser.workflowKey` (a separate workflow you define), with up to `concurrency` child runs in flight per page. Prefer this over a hand-rolled `forEach` when the fan-out is app-wide and long-running.

Each child run receives the iterated user's id as `input.userId` automatically — a child that needs nothing else can read <span v-pre>`{{ input.userId }}`</span> with no `perUser.input` block at all. When you do supply `perUser.input`, its values are rendered per user against a `user` binding — the iterated user's row, with `user.userId` and `user.role` — and full template syntax works, including fallbacks and filters:

```toml novalidate
[steps.perUser.input]
greetingName = "{{ user.userId | upper }}"
tier = "{{ user.role || 'member' }}"
reason = "preferences backfill"        # static values pass through unchanged
```

A key you set in `perUser.input` wins over the injected default, so <span v-pre>`userId = "{{ user.userId }}"`</span> is redundant but harmless.

### `switch`

First-match branching: `when` cases are CEL expressions evaluated top-to-bottom, and the first truthy case's `output` is returned:

```toml
[[steps]]
id = "tier"
kind = "switch"
saveAs = "plan"

[[steps.cases]]
when = "input.score >= 90"
[steps.cases.output]
label = "gold"

[[steps.cases]]
when = "input.score >= 70"
[steps.cases.output]
label = "silver"

[steps.default]
[steps.default.output]
label = "standard"
```

`default` is opt-in — without it, a no-match fails the step.

### `delay`

Pauses the run:

```toml
[[steps]]
id = "wait"
kind = "delay"
ms = 5000               # number, or "5 seconds" / "200ms"
```

### `event.wait`

Suspends the workflow until a matching external event is delivered to the run:

```toml
[[steps]]
id = "wait-approval"
kind = "event.wait"
type = "user-approval"
timeout = 86400000      # milliseconds
```

### `llm.chat`

LLM chat completion:

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

Optional fields include `temperature`, `top_p`, `tools`, and `tool_choice`. Output is typically `{ content, role, metrics }`. To control max tokens or version your prompts, use `prompt.execute` with a [managed prompt](./prompts.md) instead.

### `gemini.generate`

Calls Google Gemini. `gemini.generateRaw` takes the same shape forwarded as a raw API payload; `gemini.countTokens` returns a token count.

```toml
[[steps]]
id = "extract"
kind = "gemini.generate"
model = "models/gemini-2.5-flash"

[steps.prompt]
[[steps.prompt.messages]]
role = "user"
[[steps.prompt.messages.parts]]
type = "text"
text = "Summarize: {{ input.content }}"
```

The `model` must be on the server's allow-list of Gemini models — a disallowed model is rejected when you save the workflow, not when it runs.

### `prompt.execute`

Runs a [managed prompt](./prompts.md) — versioned, testable, and configured outside the workflow:

```toml
[[steps]]
id = "summarize"
kind = "prompt.execute"
promptKey = "summarizer"      # must be active
saveAs = "summary"

[steps.variables]
text = "{{ input.content }}"
```

### `integration.call`

Calls an external API through a configured [integration](./api-integrations.md), with credentials resolved server-side:

```toml
[[steps]]
id = "fetch"
kind = "integration.call"
integrationKey = "weather-api"
saveAs = "weather"

[steps.request]
method = "GET"
path = "/current"

[steps.request.query]
city = "{{ input.city }}"
```

Keep credentials in the integration config (where <span v-pre>`{{ secrets.* }}`</span> resolves server-side) rather than passing them through `request.headers` — that way secrets never appear in workflow step output snapshots.

### Database Steps

`database.query`, `database.mutate`, `database.count`, `database.aggregate`, `database.pipeline`, and `database.applyToQuery` run [registered database operations](./working-with-databases.md). All take `databaseId`, `operationName`, and optional `params`:

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

[[steps]]
id = "mark-overdue"
kind = "database.applyToQuery"
databaseId = "{{ input.dbId }}"
operationName = "mark-overdue"
[steps.params]
now = "{{ now }}"
```

There's no batch-write step: to apply a set of database updates, run `forEach` over a `database.mutate` step, or use `database.applyToQuery` to update every record matching a server-side filter.

### Document Steps

`document.query`, `document.queryOne`, `document.count`, `document.save`, `document.patch`, and `document.delete` read and write records in a [document's](./working-with-documents.md) models. Every document step takes a `documentId` and a `modelName`; queries take an optional `filter` (the same operator syntax as client-side model queries) and `options` (`sort`, `limit`, cursor pagination), and writes target a `recordId`:

```toml
[[steps]]
id = "overdue"
kind = "document.query"
documentId = "{{ input.docId }}"
modelName = "Invoice"
saveAs = "invoices"
[steps.filter]
status = "overdue"
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

`document.save` creates or replaces the record at `recordId`; `document.patch` merges its `data` fields into it. Step results: `document.query` returns `{ data, hasMore, nextCursor }` (pageable with `collect`), `document.queryOne` returns `{ record }` (`null` when nothing matches), `document.count` returns `{ count }`, the writes return `{ record }`, and `document.delete` returns `{ deleted, id }`.

Writes are durable when the step completes and reach connected clients like any other document change — use document steps when the workflow owns the write. When the result should instead land in data only clients write, leave the writing to [client apply](#applying-results-to-local-data-client-apply).

**Caller-mode access.** In a [caller workflow](#system-workflows) (the default), document steps act with the **starting user's** own document permissions, checked per operation: the reads (`query`, `queryOne`, `count`) need `reader` on the target document, `save` and `patch` need `read-write`, and `delete` needs `owner`. A step that reaches past what the caller may do fails the run — so a templated or user-supplied `documentId` can't be used to touch a document the caller couldn't open themselves. A [system workflow](#system-workflows) runs with the app's privileges and skips these per-caller checks.

**Targeting a document by alias.** Instead of a fixed `documentId`, a step can name a document by its [alias](./working-with-documents.md#ensuring-exactly-one-document-with-aliases) — convenient for the one-document-per-user pattern, where each caller has their own:

```toml
[[steps]]
id = "load"
kind = "document.query"
modelName = "Habit"
saveAs = "habits"
[steps.documentAlias]
scope = "user"          # the caller's own alias (or "app" for an app-shared one)
aliasKey = "tracker"
```

Give a step either `documentId` or `documentAlias`, not both. A `user`-scoped alias always resolves to the caller's own document; an `app`-scoped alias resolves only when the caller has access to it. If the alias doesn't resolve, the step fails the same way a missing `documentId` would.

**Branching on whether an alias exists.** When you'd rather check than fail — "has this user set up their tracker yet?" — use `document.resolveAlias`. It returns `{ documentId }`, or `{ documentId: null }` when there's nothing to resolve, so a later step can `runIf` on the result instead of erroring:

```toml
[[steps]]
id = "find-tracker"
kind = "document.resolveAlias"
scope = "user"
aliasKey = "tracker"
saveAs = "tracker"
```

### Group Steps

`group.addMember`, `group.removeMember`, `group.checkMembership`, `group.listMembers`, and `group.listUserMemberships` manage [groups](./users-and-groups.md) from a workflow:

```toml
[[steps]]
id = "add"
kind = "group.addMember"
groupType = "team"
groupId = "{{ input.teamId }}"
userId = "{{ input.userId }}"   # or email = "...", not both
```

Group steps evaluate the group type's rule sets like any other caller; rules can match workflow-issued operations with `fromWorkflow("workflowKey")` — see [Access Control](./access-control.md). In a [system run](#system-workflows), `addMember` and `removeMember` record the app's system principal as the member's `addedBy` — not the admin or trigger that started the run.

### `collect`

Auto-paginates any step that returns `{ items, cursor }` (or `{ data, nextCursor }`), merging all pages into one result:

```toml
[[steps]]
id = "all-users"
kind = "collect"
itemsField = "data"
cursorField = "nextCursor"
maxPages = 20

[steps.step]
kind = "database.query"
databaseId = "{{ input.dbId }}"
operationName = "listUsers"
limit = 100
```

### `workflow.call`

Runs a child workflow synchronously, inline. The child gets its own isolated `input` — it does not see the parent's steps or outputs:

```toml
[[steps]]
id = "onboard"
kind = "workflow.call"
workflowKey = "onboard-user"
[steps.input]
userId = "{{ input.userId }}"
```

Add `forEach` to fan out — the child runs once per item, and the step returns the array of child results. For app-wide, restartable fan-out over your entire user roster, use [`iterate-users`](#iterate-users) instead.

### `email.send`

Sends an email from inside a workflow. It has two modes.

#### Template Mode

Use a registered email template — either a built-in type (`magic-link`, `otp`, `document-share`, etc.) or a custom one you registered:

```toml
[[steps]]
id = "order-confirmation"
kind = "email.send"
templateType = "order-confirmation"
to = "{{ input.customerEmail }}"

[steps.variables]
orderId = "{{ input.orderId }}"
total = "{{ input.total }}"
```

Register custom template types with any kebab-case name. Manage them with the CLI:

```bash
primitive email-templates set order-confirmation \
  --subject "Your order #{{orderId}}" \
  --html-file ./order.html
```

For the full CLI reference for managing and customizing email templates — including listing variables, testing, and reverting to defaults — see [Email Template Customization](./authentication.md#email-template-customization).

#### Inline Mode

For one-off or dynamically constructed emails, specify subject and body directly in the step:

```toml
[[steps]]
id = "report-ready"
kind = "email.send"
to = "{{ input.email }}"
subject = "Your report is ready"
htmlBody = "<p>Download: <a href=\"{{ outputs.upload.signedUrl }}\">link</a></p>"
textBody = "Download: {{ outputs.upload.signedUrl }}"
```

`to` is a single address. To fan out to many recipients, use `forEach`:

```toml
[[steps]]
id = "blast"
kind = "email.send"
forEach = "input.recipients"
as = "addr"
to = "{{ addr }}"
templateType = "announcement"
```

### Blob Steps

`blob.upload`, `blob.download`, and `blob.signedUrl` read, write, and sign URLs for files in [blob buckets](./blobs-and-files.md) — the standard way to hand a generated file (a PDF report, an export) to users:

```toml
[[steps]]
id = "save"
kind = "blob.upload"
bucketKey = "reports"
filename = "{{ meta.workflowRunId }}.pdf"
contentType = "application/pdf"
contentBase64 = "{{ steps.gen.bytesBase64 }}"

[[steps]]
id = "url"
kind = "blob.signedUrl"
bucketKey = "reports"
blobId = "{{ steps.save.blobId }}"
expiresInSeconds = 3600
```

`blob.upload` returns the `blobId`; `blob.signedUrl` mints a time-limited URL you can email or return to the client. See [Blobs and Files](./blobs-and-files.md#using-buckets-in-workflows) for the full pattern.

### Analytics Steps

`analytics.write` emits analytics events from a workflow; `analytics.query` reads server-side aggregates — the simplest way to ship a recurring digest, an admin email, or a Slack post that summarizes activity:

```toml
[[steps]]
id = "log"
kind = "analytics.write"
action = "report.generated"
feature = "reports"

[[steps]]
id = "top-users-weekly"
kind = "analytics.query"
queryType = "users.top"
windowDays = 7
limit = 25
saveAs = "topUsers"
```

Query types are dotted strings — `overview.dau`, `daily-active`, `cohort-retention`, `users.top`, `events.grouped`, `workflows.top`, and friends. The query runner is **default-deny**: non-admin callers are rejected, so keep analytics workflows locked down with `accessRule = "hasRole('admin')"` (or fire them via cron).

For the full picture — what events are emitted, the client-side `logEvent` API, and how to read metrics back — see [Analytics](./analytics.md).

### `noop`

Returns `{ message, payload }` unchanged. Useful as a placeholder while sketching a workflow's shape:

```toml
[[steps]]
id = "todo"
kind = "noop"
message = "replace with the real enrichment step"
```

## Template Reference

Templates are how steps read the run context (see [How Data Flows Through a Run](#how-data-flows-through-a-run)). Expressions use double braces:

```
{{ input.fieldName }}             # Workflow input
{{ steps.<id>.field }}            # Output from a previous step (by step id)
{{ outputs.<saveAs>.field }}      # Output from a step that used saveAs
{{ secrets.API_KEY }}             # App secret (read-only)
{{ input.name | default:"Anonymous" }}   # Filters with single |
{{ input.title || "Untitled" }}            # Fallback with double || (or)
```

When the entire string is one expression (<span v-pre>`"{{ steps.fetch.items }}"`</span>), the raw array or object is returned. Otherwise expressions are coerced to strings and interpolated.

`secrets.*` reads from your app's server-side secret store — see [App Secrets](./app-secrets.md) for managing values and where they're safe to reference.

### Built-In Helpers

Four zero-argument helpers are always available. They re-evaluate on every reference — <span v-pre>`{{ now }} {{ now }}`</span> produces two different timestamps:

| Name | Returns |
|---|---|
| `now` | Current ISO 8601 timestamp |
| `today` | Current UTC date as `YYYY-MM-DD` |
| `uuid` | Fresh random UUID v4 |
| `ulid` | Fresh random ULID (lexicographically sortable) |

```toml
[[steps]]
id = "name-report"
kind = "transform"
[steps.output]
filename = "report-{{ today }}-{{ ulid }}.pdf"
generatedAt = "{{ now }}"
```

### Fallbacks and Filters

Use `||` for fallbacks and a single `|` to chain filters:

```
{{ input.title || 'Untitled' }}
{{ input.data | json }}                  # pretty JSON
{{ input.tags | join: ', ' }}
{{ input.users | pluck: 'email' | uniq }}
{{ input.list | sort: 'name' | first }}
{{ input.text | upper | truncate: '100' }}
{{ input.amount | toFixed: '2' }}
{{ input.id | expect: 'string' }}        # throws on type mismatch
```

Filters cover type handling (`json`, `string`, `number`, `boolean`, `default`, `expect`), strings (`upper`, `lower`, `trim`, `split`, `replace`, `truncate`, `startsWith`, `endsWith`, `contains`), arrays (`length`, `first`, `last`, `keys`, `values`, `join`, `pluck`, `where`, `sort`, `reverse`, `flatten`, `uniq`, `compact`, `slice`, `concat`), numbers (`round`, `floor`, `ceil`, `abs`, `toFixed`), and dates (`toISOString`).

Templates have **no arithmetic** — <span v-pre>`{{ a + b }}`</span> won't resolve. Do math in a `script` step or a filter chain.

### Unresolved Paths

In interpolation mode an unresolved path renders as `<missing: steps.x.y>`, so the gap is visible in step output and logs. In single-expression mode it resolves to `null`, so downstream `runIf` comparisons work naturally. Set `strict = true` on a step to make any unresolved template path fail the step instead.

## Next Steps

- **[Prompts](./prompts.md)** — Versioned, testable LLM prompt templates
- **[Working with Databases](./working-with-databases.md)** — Server-side structured storage
- **[Blobs and Files](./blobs-and-files.md)** — General-purpose file storage
- **[Primitive CLI](./primitive-cli.md)** — Full CLI command reference
