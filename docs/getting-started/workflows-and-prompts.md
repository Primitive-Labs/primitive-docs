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
