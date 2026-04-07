# Workflows and Prompts

Primitive provides server-side workflow automation and managed LLM prompts. Workflows let you chain together LLM calls, data transformations, external API requests, and conditional logic — all defined as version-controlled TOML config files.

## Workflows

A workflow is a multi-step automation pipeline that runs on the server. You define the steps, and Primitive executes them in sequence.

### Creating a Workflow

Define a workflow in a TOML config file:

```toml
# config/workflows/welcome-email.toml
[workflow]
name = "welcome-email"
displayName = "Welcome Email Workflow"

[[steps]]
name = "generate-message"
type = "llm.chat"
messages = [
  { role = "system", content = "You write friendly, concise welcome emails." },
  { role = "user", content = "Write a welcome email for {{ input.userName }}." },
]
temperature = 0.7
max_tokens = 500

[[steps]]
name = "send-email"
type = "integration.call"
integrationKey = "email-service"
method = "POST"
path = "/send"
body = """
{
  "to": "{{ input.userEmail }}",
  "subject": "Welcome!",
  "body": "{{ outputs.generate-message.content }}"
}
"""
```

Push it to the server:

```bash
primitive sync push --dir ./config
primitive workflows publish welcome-email
```

### Step Types

| Type | Description |
|---|---|
| `llm.chat` | Call an LLM (OpenRouter) with messages |
| `gemini.generate` | Call Google Gemini |
| `prompt.execute` | Run a managed prompt |
| `integration.call` | Call an external API via configured integration |
| `transform` | Transform data with a template expression |
| `delay` | Pause execution for a specified duration |
| `event.wait` | Wait for an external event/webhook |
| `noop` | No operation (useful for conditional branching) |
| `database.query` | Run a registered database query operation |
| `database.mutate` | Run a registered database mutation operation |
| `database.count` | Run a registered database count operation |
| `database.aggregate` | Run a registered database aggregation |
| `database.pipeline` | Run a registered database pipeline |
| `group.addMember` | Add a user to a group |
| `group.removeMember` | Remove a user from a group |
| `group.checkMembership` | Check if a user belongs to a group |
| `group.listMembers` | List members of a group |
| `group.listUserMemberships` | List groups a user belongs to |
| `collect` | Auto-paginate a data source and merge all pages |
| `workflow.call` | Run another workflow inline (synchronously) |
| `workflow.start` | Start child workflow instances in parallel |
| `workflow.await` | Wait for child workflow instances to complete |

### Template Syntax

Steps can reference workflow inputs and outputs from previous steps:

```
{{ input.fieldName }}           # Workflow input
{{ outputs.step-name.field }}   # Output from a previous step
{{ meta.workflowRunId }}        # Workflow metadata
{{ input.name | default:"Anonymous" }}  # Fallback values
```

### Conditional Execution

Skip steps based on conditions:

```toml
[[steps]]
name = "premium-feature"
type = "llm.chat"
runIf = "{{ input.isPremium }}"
messages = [
  { role = "user", content = "Generate premium content for {{ input.topic }}." },
]
```

### Starting a Workflow from Your App

```typescript
import { jsBaoClientService } from "primitive-app";

const client = await jsBaoClientService.getClientAsync();

// Start a workflow
const { workflowRunId } = await client.workflows.start("welcome-email", {
  input: {
    userName: "Alice",
    userEmail: "alice@example.com",
  },
});

// Check status
const status = await client.workflows.getStatus(workflowRunId);
console.log(status.status); // "running", "completed", "failed"
console.log(status.outputs); // Final outputs when completed

// List recent runs
const { runs } = await client.workflows.listRuns("welcome-email");
```

### Real-Time Status via WebSocket

```typescript
client.on("workflowStatus", (event) => {
  console.log(`Workflow ${event.workflowRunId}: ${event.status}`);
  if (event.status === "completed") {
    console.log("Result:", event.outputs);
  }
});
```

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

The `accessRule` is a CEL expression evaluated on `client.workflows.start()` calls but **not** on webhook triggers (which have their own signature verification). Setting it to `hasRole('owner')` effectively restricts direct starts to app owners while allowing webhooks to trigger normally. See the Workflows Agent Guide for the full `accessRule` reference.

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

```bash
primitive prompts create my-summarizer \
  --display-name "Document Summarizer" \
  --body "Summarize the following text in {{ input.style }} style:\n\n{{ input.text }}"
```

Or define in TOML:

```toml
# config/prompts/summarizer.toml
[prompt]
name = "my-summarizer"
displayName = "Document Summarizer"
body = """
Summarize the following text in {{ input.style }} style:

{{ input.text }}
"""
```

### Template Variables

Prompts use the same `{{ }}` template syntax as workflows:

```
{{ input.variable }}              # Input parameter
{{ input.name | default:"text" }} # With fallback
{{ input.items[0].name }}         # Nested access
```

### Prompt Configurations

A prompt can have multiple configurations for different LLM providers and settings:

```bash
primitive prompts configs create my-summarizer \
  --name "fast" \
  --provider openrouter \
  --model gpt-4o-mini \
  --temperature 0.3

primitive prompts configs create my-summarizer \
  --name "quality" \
  --provider gemini \
  --model gemini-2.5-pro \
  --temperature 0.7
```

### Testing Prompts

Define test cases to validate prompt behavior:

```bash
primitive prompts test-cases create my-summarizer \
  --name "basic-test" \
  --input '{"text": "Long article text...", "style": "bullet points"}' \
  --verification-type contains \
  --expected-output "•"

# Run tests
primitive prompts test my-summarizer
```

Verification types include `contains`, `pattern` (regex), `json_subset`, and `llm_eval` (uses an LLM to judge output quality).

### Using Prompts in Your App

```typescript
const result = await client.prompts.execute("my-summarizer", {
  input: { text: documentText, style: "concise" },
  configName: "fast", // Optional: specify which configuration
});

console.log(result.output);
```

### Using Prompts in Workflows

```toml
[[steps]]
name = "summarize"
type = "prompt.execute"
promptName = "my-summarizer"
configName = "quality"
input = { text = "{{ input.documentText }}", style = "professional" }
```

## External API Integrations

Integrations let your workflows (and client code) call external APIs securely. Primitive stores credentials server-side.

### Defining an Integration

```toml
# config/integrations/weather-api.toml
[integration]
name = "weather-api"
displayName = "Weather API"
baseUrl = "https://api.weather.com/v1"

[[integration.allowedPaths]]
path = "/forecast/*"
methods = ["GET"]

[integration.headers]
X-API-Key = "{{ secrets.WEATHER_API_KEY }}"
```

```bash
# Add the secret
primitive integrations secrets add weather-api WEATHER_API_KEY

# Push config
primitive sync push --dir ./config
```

### Calling from Your App

```typescript
const response = await client.integrations.call({
  integrationKey: "weather-api",
  method: "GET",
  path: "/forecast/san-francisco",
  query: { units: "metric" },
});
```

## CLI Workflow

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

# Publish a workflow (make it executable)
primitive workflows publish my-workflow

# Monitor runs
primitive workflows runs list
primitive workflows runs get <runId>
```

## Next Steps

- **[Working with Databases](./working-with-databases.md)** — Server-side data that workflows can act on
- **[Primitive CLI](./primitive-cli.md)** — Full CLI command reference
- **[Overview](/)** — See how workflows fit into the platform
