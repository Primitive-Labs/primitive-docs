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
primitive sync push --dir ./config
```

`sync push` creates and updates the workflow's active configuration in place. Once `status = "active"`, the workflow can be invoked.

## Step Types

Every step has an `id` (unique within the workflow) and a `kind` (the step type). The kinds the engine supports:

| Kind | Purpose |
|---|---|
| `transform` | Shape a value with the templated `output` field — typically used for the workflow's final result |
| `script` | Run a sandboxed, deterministic Rhai script to transform JSON (see [Script transforms](#script-transforms)) |
| `iterate-users` | Restartable per-user fan-out: run sub-steps once for every app user |
| `switch` | First-match branching across CEL `when` cases |
| `delay` | Pause execution (`ms = 5000` or `"5 seconds"`) |
| `event.wait` | Suspend until an external event with the matching type arrives |
| `llm.chat` | LLM chat completion |
| `gemini.generate` / `gemini.generateRaw` / `gemini.countTokens` | Google Gemini |
| `prompt.execute` | Run a [managed prompt](./prompts.md) |
| `integration.call` | Call an external API via a configured integration |
| `database.query` / `mutate` / `count` / `aggregate` / `pipeline` / `applyToQuery` | Run registered database operations |
| `group.addMember` / `removeMember` / `checkMembership` / `listMembers` / `listUserMemberships` | Group membership operations |
| `collect` | Auto-paginate any step that returns `{ items, cursor }` |
| `workflow.call` | Run a child workflow synchronously, inline |
| `workflow.start` + `workflow.await` | Fan out child workflows in parallel, then wait |
| `email.send` | Send an email (template-based or inline) |
| `blob.upload` / `blob.download` / `blob.signedUrl` | Read, write, or sign blob URLs |
| `analytics.write` / `analytics.query` | Emit analytics events or query server-side aggregates |
| `noop` | Return `{ message, payload }`; useful as a placeholder |

There's no batch-write step: to apply a set of database updates, run `forEach` over a `database.mutate` step, or use `database.applyToQuery` to update every record matching a server-side filter.

## Template Syntax

Templates use double braces. They reference the workflow's run context:

```
{{ input.fieldName }}             # Workflow input
{{ steps.<id>.field }}            # Output from a previous step (by step id)
{{ outputs.<saveAs>.field }}      # Output from a step that used saveAs
{{ secrets.API_KEY }}             # App secret (read-only)
{{ input.name | default:"Anonymous" }}   # Filters with single |
{{ input.title || "Untitled" }}            # Fallback with double || (or)
```

Four built-in helpers are always available — <span v-pre>`{{ now }}`</span> (ISO timestamp), <span v-pre>`{{ today }}`</span> (YYYY-MM-DD), <span v-pre>`{{ uuid }}`</span>, <span v-pre>`{{ ulid }}`</span>. They re-evaluate on every reference.

When the entire string is one expression (<span v-pre>`"{{ steps.fetch.items }}"`</span>), the raw array or object is returned. Otherwise expressions are coerced to strings and interpolated.

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

```typescript
const result = await client.workflows.runSync({
  workflowKey: "validate-coupon",
  input: { code: "WELCOME10" },
  timeoutMs: 5000,    // server caps at 30s
});
if (result.status === "completed") {
  console.log(result.output);
}
```

The promise resolves for every terminal outcome; only network errors reject. Long-running workflows should use asynchronous `start()` instead.

### Applying Results to Local Data (Client Apply)

A workflow runs on the server, but its result often belongs in a **document** — local-first data only clients write. Set `requiresClientApply = true` on the workflow and the run doesn't finish at the last step: it transitions to `apply_pending`, and a connected client claims it, writes the output into the document, and confirms:

1. The client registers an apply handler for the workflow with `workflows.define(workflowKey, { onApply })`.
2. When a run reaches `apply_pending`, a client calls `claimApply()` (an exclusive, time-limited claim), runs the handler, then `confirmApply()` — or `releaseApply()` on failure so another client can retry.
3. The template helpers and Swift's `runAndApply(...)` wrap this loop for you — most apps never call claim/confirm directly.

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

Two limits: 50 cron triggers per app (consolidate with a single trigger fanning out via `workflow.start`), and 1-minute minimum granularity.

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

```typescript [JavaScript]
const { items: steps } = await client.workflows.listStepRuns({ runId });
steps.forEach((step) => console.log(step.kind, step.status, step.output));
```

```swift [Swift]
let result = try await client.workflows.listStepRuns(runId: runId)
let steps = result["items"] as? [[String: Any]] ?? []
```

:::

## Script Transforms

For data shaping that's more involved than a templated `transform` step — reshaping nested JSON, computing derived fields, filtering and mapping arrays — a `script` step runs a sandboxed [Rhai](https://rhai.rs/) script over its JSON input and returns JSON. Scripts are **deterministic and side-effect-free** (no network, no clock, no storage), so they're safe to retry and easy to test.

Author script bodies as `transforms/<name>.rhai` files in your sync directory and push them with `primitive sync push`. Two wiring details: the step's `with` table reaches the script as `input.*` (not bare variables), and the script's return value lands under `steps.<id>.output.*` for later steps.

## Email Steps

The `email.send` step sends an email from inside a workflow. It has two modes.

### Template Mode

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

### Inline Mode

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

## Analytics Query Step

Workflows can query analytics data server-side — the simplest way to ship a recurring digest, an admin email, or a Slack post that summarizes activity:

```toml
[[steps]]
id = "top-users-weekly"
kind = "analytics.query"
queryType = "users.top"
windowDays = 7
limit = 25
saveAs = "topUsers"
```

Query types are dotted strings — `overview.dau`, `daily-active`, `cohort-retention`, `users.top`, `events.grouped`, `workflows.top`, and friends. The runner is **default-deny**: non-admin callers are rejected, so keep analytics workflows locked down with `accessRule = "hasRole('admin')"` (or fire them via cron).

For the full picture — what events are emitted, the client-side `logEvent` API, and how to read metrics back — see [Analytics](./analytics.md).

## Calling External APIs from a Workflow

Integrations let workflows call external APIs with server-side credentials — see [API Integrations](./api-integrations.md) for defining one. In a workflow, use the `integration.call` step:

```toml
[[steps]]
id = "fetch-weather"
kind = "integration.call"
integrationKey = "weather-api"

[steps.request]
method = "GET"
path = "/forecast/{{ input.city }}"
```

Keep credentials in the integration config (where <span v-pre>`{{ secrets.* }}`</span> resolves server-side) rather than passing them through `request.headers` — that way secrets never appear in workflow step output snapshots.

## Syncing Workflow Config

```bash
# Initialize config
primitive sync init --dir ./config

# Pull current server config
primitive sync pull --dir ./config

# Edit TOML files locally...

# See what changed
primitive sync diff --dir ./config

# Push changes
primitive sync push --dir ./config
```

When a workflow needs flags `sync push` doesn't carry (`requiresClientApply`, `syncCallable`, queue caps), set them with `primitive workflows update`.

For reusable step blocks, lift them into `<workflowDir>/../workflow-fragments/<name>.toml` and reference them from a workflow via `include = ["<name>"]`. The CLI flattens fragment references before push; `primitive workflows expand <workflow.toml>` prints the expanded result for debugging.

## Next Steps

- **[Prompts](./prompts.md)** — Versioned, testable LLM prompt templates
- **[Working with Databases](./working-with-databases.md)** — Server-side structured storage
- **[Blob Buckets](./blob-buckets.md)** — General-purpose file storage
- **[Primitive CLI](./primitive-cli.md)** — Full CLI command reference
