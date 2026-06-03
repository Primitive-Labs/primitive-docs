# Workflows and Prompts

Primitive provides server-side workflow automation and managed LLM prompts. Workflows let you chain together LLM calls, data transformations, external API requests, and conditional logic — all defined as version-controlled TOML config files.

## Workflows

A workflow is a multi-step automation pipeline that runs on the server. You define the steps, and Primitive executes them in sequence.

### Creating a Workflow

Define a workflow in a TOML config file:

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

`sync push` creates and updates the workflow's active configuration in place. Once `status = "active"` and at least one configuration exists, clients can start runs.

### Step Types

Every step has an `id` (unique within the workflow) and a `kind` (the step type). The kinds the engine supports:

| Kind | Purpose |
|---|---|
| `transform` | Shape a value with the templated `output` field — typically used for the workflow's final result |
| `script` | Run a sandboxed, deterministic Rhai script to transform JSON (see [Script transforms](#script-transforms)) |
| `iterate-users` | Restartable per-user fan-out: run sub-steps once for every app user, with bounded memory and singleton locking |
| `noop` | Return `{ message, payload }`; useful as a placeholder |
| `switch` | First-match branching across CEL `when` cases |
| `delay` | Pause execution (`ms = 5000` or `"5 seconds"`) |
| `event.wait` | Suspend until an external event with the matching type arrives |
| `llm.chat` | OpenRouter chat completion |
| `gemini.generate` / `gemini.generateRaw` / `gemini.countTokens` | Google Gemini |
| `prompt.execute` | Run a managed prompt |
| `integration.call` | Call an external API via a configured integration |
| `database.query` / `mutate` / `count` / `aggregate` / `pipeline` / `applyToQuery` | Run registered database operations |
| `group.addMember` / `removeMember` / `checkMembership` / `listMembers` / `listUserMemberships` | Group membership operations |
| `collect` | Auto-paginate any step that returns `{ items, cursor }` |
| `workflow.call` | Run a child workflow synchronously, inline |
| `workflow.start` + `workflow.await` | Fan out child workflows in parallel, then wait |
| `email.send` | Send an email (template-based or inline) |
| `blob.upload` / `blob.download` / `blob.signedUrl` | Read, write, or sign blob URLs |
| `analytics.write` / `analytics.query` | Emit analytics events or query server-side aggregates |

### Template Syntax

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

### Conditional Execution

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

### Starting a Workflow from Your App

```typescript
import { jsBaoClientService } from "primitive-app";

const client = await jsBaoClientService.getClientAsync();

// Start a workflow and let it run in the background
const { runId, runKey } = await client.workflows.start({
  workflowKey: "welcome-email",
  input: {
    userName: "Alice",
    userEmail: "alice@example.com",
  },
});

// Check status
const status = await client.workflows.getStatus({
  workflowKey: "welcome-email",
  runKey,
});
console.log(status.status);  // "running" | "complete" | "failed" | "apply_pending" | ...
console.log(status.output);  // final result when complete

// List recent runs
const { items } = await client.workflows.listRuns({
  workflowKey: "welcome-email",
  limit: 50,
});
```

For short, latency-sensitive workflows (validation, enrichment, webhook responses), opt the workflow into synchronous invocation by setting `syncCallable = true` in the workflow TOML (pushed by `primitive sync push`) or via `primitive workflows update --sync-callable true`. Clients can then `await` the final result in one round-trip:

::: warning JavaScript-only
`client.workflows.runSync(...)` is currently **JavaScript-only** — the Swift client exposes `workflows.start(...)` and `runAndApply(...)` but not `runSync`. Swift apps use `start` + status polling, or `runAndApply` for the client-apply flow.
:::

```typescript
const result = await client.workflows.runSync({
  workflowKey: "validate-coupon",
  input: { code: "WELCOME10" },
  timeoutMs: 5000,    // server caps at 30s
});
// result.status: "completed" | "failed" | "timeout" | "terminated" | "apply_pending"
if (result.status === "completed") {
  console.log(result.output);
}
```

The promise resolves for every terminal outcome; only network errors reject. Long-running workflows should keep using `start()` plus status polling or WebSocket events.

### Scheduling Workflows with Cron

Trigger a workflow on a cron schedule:

```bash
primitive cron-triggers create \
  --key nightly-digest \
  --name "Nightly Digest" \
  --cron "0 9 * * *" \
  --workflow-key send-digest \
  --timezone "America/Los_Angeles" \
  --overlap-policy skip
```

Each firing creates a persistent `WorkflowRun` record so cron failures are surfaced alongside user-triggered runs. See [Scheduled and Real-Time Automation](./scheduled-and-realtime-automation.md) for the full walkthrough.

### Debugging Workflow Runs

Every step's input and output is persisted and reachable from the client:

```typescript
const { items: steps } = await client.workflows.listStepRuns({ runId });
steps.forEach(step => {
  console.log(step.kind, step.status, step.output);
});
```

You'll see the same data in the admin console under the run's detail view.

### Real-Time Status via WebSocket

```typescript
client.on("workflowStatus", (event) => {
  console.log(`Workflow run ${event.runId}: ${event.status}`);
  if (event.status === "completed") {
    console.log("Result:", event.output);
  }
});
```

### Script Transforms

For data shaping that's more involved than a templated `transform` step — reshaping nested JSON, computing derived fields, filtering and mapping arrays — a `script` step runs a sandboxed [Rhai](https://rhai.rs/) script over its JSON input and returns JSON.

Script steps are **deterministic and side-effect-free**: the sandbox has no network, no clock, and no storage access, so the same input always produces the same output. That makes them safe to retry and easy to test.

You author script bodies as `.rhai` files in your sync directory (`transforms/<name>.rhai`) and push them with `primitive sync push` alongside the rest of your config — there's no separate command. A `script` step then references a script by name and passes it a JSON input context. Each `script`-step execution records per-step telemetry on the `WorkflowRun` (`scriptMetrics`) so you can see operation counts and timing in run detail.

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

Inline mode bypasses templates entirely — useful when the subject or body depends on upstream step output and creating a template for it wouldn't add value.

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

Workflows can query analytics data server-side:

```toml
[[steps]]
id = "top-users-weekly"
kind = "analytics.query"
queryType = "users.top"
windowDays = 7
limit = 25
saveAs = "topUsers"
```

Query types are dotted strings — `overview.dau`, `overview.wau`, `overview.mau`, `overview.growth`, `daily-active`, `rolling-active`, `cohort-retention`, `users.top`, `users.search`, `users.detail`, `users.snapshot`, `events`, `events.grouped`, `workflows.top`, `prompts.top`, `integrations`. Two things worth knowing:

- **Default deny, admin/owner bypass.** The runner looks up the triggering user's app role and rejects non-admin callers before making the upstream call. Keep analytics workflows locked down with `accessRule = "hasRole('admin')"`.
- **Per-run cap of 50 queries.** If a single run issues more than 50 analytics queries, the excess are skipped.

Cache TTL overrides are available via `cacheTtlSeconds` — pass `0` or `null` to bypass the cache for a fresh read.

For the full picture — what events are emitted, the client-side `logEvent` API, and the matching CLI/REST surface — see [Analytics](./analytics.md).

## Inbound Webhooks

Inbound webhooks let external services (Stripe, GitHub, Slack, etc.) trigger workflows automatically. Each webhook has a public URL, signature verification, and automatic workflow triggering.

```bash
# Create a webhook that triggers a workflow when Stripe sends events
POST /app/{appId}/api/webhooks
{
  "webhookKey": "stripe-payments",
  "displayName": "Stripe Payments",
  "workflowKey": "handle-payment",
  "verificationScheme": "stripe",
  "signingSecret": "whsec_your_stripe_secret"
}
```

The receive endpoint is:
```
POST /app/{appId}/webhook/{webhookKey}
```

When an event is received, the webhook verifies the signature and starts the configured workflow with the event payload as `rootInput`. Supported verification schemes are `stripe`, `github`, `slack`, `custom`, and `none`.

**Securing webhook workflows:** Webhook-triggered workflows should use `accessRule` to prevent clients from bypassing signature verification by calling `client.workflows.start()` directly with a crafted payload:

```toml
[workflow]
key = "handle-payment"
name = "Handle Payment"
status = "active"
accessRule = "hasRole('owner')"  # Only webhook triggers can start this — clients are blocked
```

The `accessRule` is a CEL expression evaluated on `client.workflows.start()` calls but **not** on webhook triggers (which have their own signature verification). Setting it to `hasRole('owner')` effectively restricts direct starts to app owners while allowing webhooks to trigger normally.

Use `inputMapping` to extract a nested path from the payload before passing it to the workflow:
```json
{ "inputMapping": "data.object" }
```

Each event (accepted, rejected, duplicate) is logged and viewable via the API. Manage webhooks via the CLI:

```bash
# Create/update webhook definitions
primitive webhooks push --dir ./config

# List webhooks
primitive webhooks list

# View recent events
primitive webhooks events <webhook-id>
```

## Managed Prompts

Managed prompts are versioned, testable LLM prompt templates stored on the server. They help you iterate on prompts without redeploying your app.

### Creating a Prompt

Define a prompt in TOML and push it with `sync push`:

```toml
# config/prompts/summarizer.toml
[prompt]
key = "my-summarizer"
name = "Document Summarizer"
status = "active"
body = """
Summarize the following text in {{ variables.style }} style:

{{ variables.text }}
"""
```

### Template Variables

Prompts use the same <span v-pre>`{{ }}`</span> template syntax as workflows. The values you pass to `prompts.execute(...)` are exposed under `variables`:

```
{{ variables.text }}                          # Caller-provided variable
{{ variables.name | default:"Anonymous" }}    # With fallback
{{ variables.items[0].name }}                  # Nested access
```

### Prompt Configurations

A prompt can have multiple configurations for different providers, models, and settings. Each prompt has one active configuration; clients invoke the active one unless they ask for a specific config ID.

```bash
primitive prompts configs create <prompt-id> --name "fast" \
  --provider openrouter --model gpt-4o-mini --temperature 0.3

primitive prompts configs create <prompt-id> --name "quality" \
  --provider gemini --model gemini-2.5-pro --temperature 0.7

primitive prompts configs activate <prompt-id> <config-id>
```

### Testing Prompts

Define test cases to validate prompt behavior:

```bash
primitive prompts tests create <prompt-id> \
  --name "basic-test" \
  --variables '{"text": "Long article text...", "style": "bullet points"}' \
  --contains '["•"]'

primitive prompts tests run-all <prompt-id>
```

Verification types include substring `contains`, regex pattern, JSON subset, and LLM-as-judge.

### Using Prompts in Your App

::: code-group

<<< ../../examples/prompts/prompt-execute.ts#example{ts} [JavaScript]

<<< ../../examples/prompts/prompt-execute.swift#example{swift} [Swift]

:::

The result carries `output` (the generated text); pass `configId` to target a specific config instead of the active one.

### Using Prompts in Workflows

```toml
[[steps]]
id = "summarize"
kind = "prompt.execute"
promptKey = "my-summarizer"
saveAs = "summary"

[steps.variables]
text = "{{ input.documentText }}"
style = "professional"
```

## External API Integrations

Integrations let your workflows (and client code) call external APIs securely. Primitive stores credentials server-side.

### Defining an Integration

```toml
# config/integrations/weather-api.toml
[integration]
key = "weather-api"
name = "Weather API"
baseUrl = "https://api.weather.com/v1"

[[integration.allowedPaths]]
path = "/forecast/*"
methods = ["GET"]

[integration.defaultHeaders]
X-API-Key = "{{ secrets.WEATHER_API_KEY }}"
```

`defaultHeaders` and `staticQuery` resolve <span v-pre>`{{ secrets.* }}`</span> server-side, so secrets never appear in workflow step output snapshots. Keep credentials in the integration config rather than passing them through `request.headers` in a workflow step.

```bash
# Add the secret
primitive integrations secrets add weather-api WEATHER_API_KEY

# Push config
primitive sync push --dir ./config
```

### Calling from Your App

::: code-group

<<< ../../examples/integrations/integration-call.ts#example{ts} [JavaScript]

<<< ../../examples/integrations/integration-call.swift#example{swift} [Swift]

:::

## CLI Workflow

```bash
# Initialize config
primitive sync init --dir ./config

# Pull current server config
primitive sync pull --dir ./config

# Edit TOML files locally...

# See what changed
primitive sync diff --dir ./config

# Push changes (creates and updates the workflow's active configuration in place)
primitive sync push --dir ./config

# Monitor runs
primitive workflows runs list <workflow-id>
primitive workflows runs status <workflow-id> <run-id>
primitive workflows runs steps <workflow-id> <run-id>
```

When a workflow needs flags `sync push` doesn't carry (`requiresClientApply`, `syncCallable`, queue caps), set them with `primitive workflows update`:

```bash
primitive workflows update <workflow-id> --requires-client-apply false
```

For reusable step blocks, lift them into `<workflowDir>/../workflow-fragments/<name>.toml` and reference them from a workflow via `include = ["<name>"]`. The CLI flattens fragment references before push; the server only sees the canonical step list. `primitive workflows expand <workflow.toml>` prints the expanded result for debugging.

## Next Steps

- **[Working with Databases](./working-with-databases.md)** — Server-side data that workflows can act on
- **[Scheduled and Real-Time Automation](./scheduled-and-realtime-automation.md)** — Cron triggers and live database subscriptions
- **[Blob Buckets](./blob-buckets.md)** — Storage that workflows read and write via `blob.upload`/`blob.download`/`blob.signedUrl`
- **[Primitive CLI](./primitive-cli.md)** — Full CLI command reference
- **[Overview](/)** — See how workflows fit into the platform
