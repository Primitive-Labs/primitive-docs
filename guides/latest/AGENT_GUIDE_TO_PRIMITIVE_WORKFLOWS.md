# Workflow Agent Guide

This guide explains the workflow syntax and CLI commands for creating and managing workflows in the js-bao platform. It is designed for coding agents to understand and implement workflows.

## Overview

Workflows are multi-step automation pipelines that execute sequentially. They support:

- AI/LLM calls (OpenAI, Gemini)
- External API integrations
- Data transformation
- Conditional execution
- Managed prompts

**Key concepts:**

- **Definition**: The workflow metadata and settings
- **Draft**: Editable version of a workflow's steps (stored in R2)
- **Configuration**: A named, versioned set of steps for a workflow (replaces legacy revisions)
- **Revision**: Published, immutable version of a workflow (legacy — use configurations instead)
- **Run**: A single execution instance of a workflow

## Publishing Workflows

**Important:** Workflows must be **published** or have an **active configuration** and be set to `active` status before they can be called from the client.

### Workflow Status Lifecycle

| Status     | Has Active Config or Revision | Can Run from Client | Can Preview via CLI |
| ---------- | ----------------------------- | ------------------- | ------------------- |
| `draft`    | No                            | No                  | Yes                 |
| `draft`    | Yes                           | No                  | Yes                 |
| `active`   | Yes                           | Yes                 | Yes                 |
| `archived` | -                             | No                  | No                  |

### Publishing via Configurations (Recommended)

Configurations are the recommended way to manage workflow steps. When you create a workflow, a default configuration is automatically created.

1. **Create the workflow** (creates a draft and a default configuration)
2. **Set status to active** to allow client execution

```bash
# Step 1: Create workflow from TOML (auto-creates default config)
primitive workflows create --from-file workflow.toml

# Step 2: Set to active
primitive workflows update <workflow-id> --status active
```

To update steps, update the configuration:

```bash
# Update the active configuration's steps
primitive workflows configs update <workflow-id> <config-id> --from-file workflow.toml
```

### Publishing via Revisions (Legacy)

The legacy publish flow creates immutable revisions:

1. **Create/update the workflow** (creates a draft)
2. **Publish the draft** to create an immutable revision
3. **Set status to active** to allow client execution

```bash
# Step 1: Create workflow from TOML
primitive workflows create --from-file workflow.toml

# Step 2: Publish the draft (creates revision)
primitive workflows publish <workflow-id>

# Step 3: Set to active
primitive workflows update <workflow-id> --status active
```

**Via TOML sync:** Setting `status = "active"` in the TOML file will fail with "Cannot activate workflow without a revision or active configuration" if you haven't published or created a configuration first.

### Common Error

If you see `HTTP 404: Workflow not found` when calling `client.workflows.start()`:

1. Verify the workflow exists with `primitive workflows list`
2. Check the workflow has `status = "active"` (not `draft`)
3. Ensure the workflow has an active configuration (`activeConfigId`) or has been published (`latestRevision` should not be null)
4. If using prompts, verify those prompts also have `status = "active"`

## Workflow Configurations

Configurations are named, versioned sets of steps for a workflow. They replace the legacy revision model and provide more flexibility for managing workflow variants.

### Key Concepts

- Each workflow can have **multiple configurations** (e.g., "default", "production", "experiment-v2")
- One configuration is the **active configuration** (`activeConfigId` on the workflow)
- When a workflow runs from the client, it uses the **active configuration's steps**
- When you create a workflow, a **default configuration** is automatically created
- Configurations can be **duplicated** for A/B testing or experimentation

### Configuration Lifecycle

```
┌──────────┐     ┌──────────┐     ┌───────────┐     ┌──────────┐
│  Create  │ ──▶ │  Update  │ ──▶ │ Activate  │ ──▶ │   Run    │
│  Config  │     │  Steps   │     │  Config   │     │          │
└──────────┘     └──────────┘     └───────────┘     └──────────┘
                      │
                      ▼
                ┌──────────┐     ┌──────────┐
                │Duplicate │ ──▶ │  Archive  │
                │          │     │           │
                └──────────┘     └──────────┘
```

### CLI Commands for Configurations

```bash
# List all configurations for a workflow
primitive workflows configs list <workflow-id>

# Get a specific configuration (includes steps)
primitive workflows configs get <workflow-id> <config-id>

# Create a new configuration with steps from a TOML file
primitive workflows configs create <workflow-id> --name "production" --from-file workflow.toml

# Update a configuration's steps
primitive workflows configs update <workflow-id> <config-id> --from-file workflow.toml

# Activate a configuration (makes it the one used for client execution)
primitive workflows configs activate <workflow-id> <config-id>

# Duplicate a configuration
primitive workflows configs duplicate <workflow-id> <config-id> --name "experiment-v2"

# Archive a configuration (cannot archive the active config)
primitive workflows configs archive <workflow-id> <config-id>
```

### Preview with a Specific Configuration

```bash
# Preview using a specific configuration instead of the draft
primitive workflows preview <workflow-id> --config <config-id> --input '{"text":"hello"}' --wait
```

---

## Workflow Definition Structure

Workflows are defined in **TOML format** for CLI operations and stored as **JSON** internally.

### Basic TOML Structure

```toml
[workflow]
key = "unique-workflow-key"           # Required: unique identifier per app
name = "Human Readable Name"          # Required: display name
description = "What this workflow does"  # Optional
status = "draft"                      # draft | active | archived

# Concurrency settings (optional)
perUserMaxRunning = 4                 # Max concurrent runs per user (default: 4)
perUserMaxQueued = 100                # Max queued runs per user (default: 100)
perAppMaxRunning = 25                 # Max concurrent runs per app (default: 25)
perAppMaxQueued = 10000               # Max queued runs per app (default: 10000)
queueTtlSeconds = 43200              # Queue TTL in seconds (default: 43200 = 12h)
dequeueOrder = "fifo"                 # fifo | lifo (default: fifo)

# Schema validation (optional, JSON strings)
inputSchema = "{\"type\":\"object\",\"properties\":{...}}"
outputSchema = "{\"type\":\"object\",\"properties\":{...}}"

# Steps array
[[steps]]
id = "step-1"
kind = "transform"
# ... step-specific fields
```

## Step Types

### 1. `noop` - No Operation

Placeholder step for testing/debugging.

```toml
[[steps]]
id = "placeholder"
kind = "noop"
message = "This step does nothing"

[steps.payload]
debug = true
```

### 2. `transform` - Data Transformation

Transforms data using templating. Use `saveAs = "output"` for the final workflow output.

```toml
[[steps]]
id = "format-output"
kind = "transform"
saveAs = "output"           # Save result as named variable

[steps.output]
title = "{{ input.name }}"
summary = "{{ outputs.extraction.text }}"
timestamp = "{{ meta.startedAt }}"
```

### 3. `llm.chat` - OpenAI Chat Completion

Calls the internal LLM service.

```toml
[[steps]]
id = "generate-text"
kind = "llm.chat"
model = "gpt-4o-mini"       # or "gpt-4o", "gpt-4", etc.
saveAs = "response"

[[steps.messages]]
role = "system"
content = "You are a helpful assistant."

[[steps.messages]]
role = "user"
content = "{{ input.question }}"

# Optional parameters
# temperature = 0.7
# maxTokens = 1000
# top_p = 0.9
```

**Additional parameters:**

| Parameter      | Type     | Description                              |
| -------------- | -------- | ---------------------------------------- |
| `temperature`  | number   | Sampling temperature (0-2)               |
| `maxTokens`    | number   | Maximum tokens in response               |
| `top_p`        | number   | Nucleus sampling parameter               |
| `attachments`  | array    | File attachments for multimodal input     |
| `plugins`      | array    | Plugin configurations                     |
| `tools`        | object   | Tool/function calling definitions         |
| `tool_choice`  | object   | Tool selection strategy                   |

### 4. `gemini.generate` - Google Gemini Generation

Calls the Google Gemini API with structured prompts.

```toml
[[steps]]
id = "extract"
kind = "gemini.generate"
model = "models/gemini-2.5-flash"
thinkingLevel = "minimal"   # minimal | low | medium | high (Gemini 3 only)
saveAs = "summary"

[steps.prompt]
[[steps.prompt.messages]]
role = "user"

[[steps.prompt.messages.parts]]
type = "text"
text = "Summarize the following: {{ input.content }}"
```

### 5. `gemini.generateRaw` - Raw Gemini API Call

Direct Gemini API payload (advanced use).

```toml
[[steps]]
id = "raw-gemini"
kind = "gemini.generateRaw"
model = "models/gemini-2.5-flash"

[steps.prompt]
# Raw Gemini API payload structure
```

### 6. `gemini.countTokens` - Token Counting

Count tokens for a Gemini prompt.

```toml
[[steps]]
id = "count"
kind = "gemini.countTokens"
model = "models/gemini-2.5-flash"

[steps.prompt]
# Gemini prompt structure
```

### 7. `integration.call` - External API Call

Calls a configured integration (external API).

```toml
[[steps]]
id = "fetch-data"
kind = "integration.call"
integrationKey = "weather-api"   # Must match configured integration
saveAs = "weather"

[steps.request]
method = "GET"
path = "/current"

[steps.request.query]
city = "{{ input.city }}"

[steps.request.headers]
X-Custom = "value"

# [steps.request.body]
# For POST/PUT requests
```

### 8. `prompt.execute` - Execute Managed Prompt

Executes a configured AppPrompt (managed prompt template).

```toml
[[steps]]
id = "summarize"
kind = "prompt.execute"
promptKey = "summarizer"        # Must match configured prompt
saveAs = "summary"
# modelOverride = "gpt-4"       # Optional: override prompt's default model
# configId = "config-id"        # Optional: use a specific prompt configuration

[steps.variables]
text = "{{ input.content }}"
maxLength = 500
```

**Parameters:**

| Parameter       | Type   | Description                                      |
| --------------- | ------ | ------------------------------------------------ |
| `promptKey`     | string | Required. Key of the configured prompt            |
| `variables`     | object | Template variables to pass to the prompt          |
| `modelOverride` | string | Optional. Override the prompt's default model     |
| `configId`      | string | Optional. Use a specific prompt configuration ID  |

### 9. `delay` - Pause Execution

Pauses workflow execution.

```toml
[[steps]]
id = "wait"
kind = "delay"
ms = 5000                       # Milliseconds (number)
# or: ms = "5 seconds"          # Duration string
```

### 10. `event.wait` - Wait for External Event

Waits for an external event (e.g., user approval).

```toml
[[steps]]
id = "wait-approval"
kind = "event.wait"
type = "user-approval"
timeout = "24 hours"            # Optional timeout
```

## Templating Syntax

Workflows use Mustache-style `{{ }}` templates with path resolution.

### Template Context Variables

| Variable   | Description                                     |
| ---------- | ----------------------------------------------- |
| `input`    | Root input payload passed to the workflow       |
| `selected` | Result of step's `selector` (if used)           |
| `steps`    | All step outputs by step ID                     |
| `outputs`  | Named outputs (via `saveAs`)                    |
| `meta`     | Workflow metadata (`startedAt`, `userId`, etc.) |

### Path Access Examples

```toml
# Basic field access
"{{ input.fieldName }}"

# Nested access
"{{ input.user.profile.name }}"

# Array index
"{{ input.items[0] }}"

# Bracket notation (for special characters)
"{{ input['key-name'] }}"

# Access previous step output (by step ID)
"{{ steps.step-id.content }}"

# Access named output (by saveAs name)
"{{ outputs.myResult.field }}"

# Metadata
"{{ meta.startedAt }}"
"{{ meta.userId }}"
```

### Fallback Values

Use `||` for fallback/default values:

```toml
# String fallback
title = "{{ input.title || 'Untitled' }}"

# Numeric fallback
count = "{{ input.count || 0 }}"

# Empty string fallback
text = "{{ input.text || '' }}"

# Chained fallback
value = "{{ input.primary || input.fallback || 'default' }}"
```

### Single Expression Mode

When the entire value is a single template expression, the raw value is preserved (arrays/objects are not stringified):

```toml
# Returns array, not "[object Object]"
items = "{{ input.itemsList }}"
```

## Conditional Execution (`runIf`)

Each step can include a `runIf` condition to control execution.

### Truthy Check

```toml
[[steps]]
id = "optional-step"
kind = "transform"
runIf = "input.shouldRun"       # Runs if input.shouldRun is truthy
```

### Numeric Comparison

```toml
[[steps]]
id = "short-content-step"
kind = "transform"
runIf = "outputs.text.length < 1000"   # Runs if text length < 1000
```

### Fallback Logic

```toml
[[steps]]
id = "has-content"
kind = "transform"
runIf = "input.primary || input.fallback"   # Runs if either is truthy
```

**Supported operators:**

- `< number` - Less than comparison
- `||` - Fallback/OR logic
- Truthy evaluation (any path resolves to truthy value)

**Not supported:**

- Arithmetic (`+`, `-`, `*`, `/`)
- Equality comparisons (`==`, `!=`)
- Greater than (`>`, `>=`, `<=`)
- Custom functions

## Input Selectors

Steps can use `selector` to change their input context:

```toml
[[steps]]
id = "process-selected"
kind = "transform"

[steps.selector]
source = "step"
stepId = "previous-step"

[steps.output]
# Use "selected" instead of "input"
processed = "{{ selected.value }}"
```

**Selector sources:**

- `{ source = "root" }` - Use root input (default)
- `{ source = "step", stepId = "step-id" }` - Use output from specific step
- `{ source = "context", path = "outputs.namedOutput" }` - Use path into context

## Output Contract

### How outputs are stored:

1. Every step result is stored under `steps[stepId]`
2. If step has `saveAs`, also stored under `outputs[saveAs]`
3. Final workflow output is:
   - `outputs.output` if any step used `saveAs = "output"`
   - Otherwise, the full `outputs` map

### Best Practice

Always have a final `transform` step with `saveAs = "output"` to define the workflow's return value:

```toml
[[steps]]
id = "final-output"
kind = "transform"
saveAs = "output"

[steps.output]
result = "{{ steps.process.content }}"
success = true
```

---

## CLI Commands

The `primitive workflows` command manages workflows. Most commands require an app context (set with `primitive use <app-id>` or `--app <app-id>`).

### Workflow Lifecycle

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│ Create  │ ──▶ │  Update  │ ──▶ │ Preview │ ──▶ │ Activate │
│         │     │  Config  │     │         │     │          │
└─────────┘     └──────────┘     └─────────┘     └──────────┘
                     │                                │
                     ▼                                ▼
                ┌─────────┐                     ┌─────────┐
                │  Test   │                     │   Run   │
                │  Cases  │                     │         │
                └─────────┘                     └─────────┘
```

### Create Workflow

```bash
# Create from TOML file (recommended)
primitive workflows create --from-file workflow.toml

# Create with inline options
primitive workflows create --key my-workflow --name "My Workflow"
```

### Update Draft Steps

```bash
primitive workflows draft update <workflow-id> --from-file workflow.toml
```

### Preview Execution (Test Draft or Configuration)

```bash
# Start preview and wait for result
primitive workflows preview <workflow-id> --input '{"text":"hello"}' --wait

# Start preview (returns instance ID for polling)
primitive workflows preview <workflow-id> --input '{"text":"hello"}'

# Preview a specific configuration
primitive workflows preview <workflow-id> --config <config-id> --input '{"text":"hello"}' --wait
```

**Preview source priority:**

1. If `--config <config-id>` is provided, uses that configuration's steps
2. Otherwise if a draft exists, uses the draft steps
3. Otherwise if an active configuration exists, uses its steps
4. Otherwise fails with "Workflow has no draft or configuration to preview"

### Publish Draft

```bash
primitive workflows publish <workflow-id>
```

### List Workflows

```bash
primitive workflows list
primitive workflows list --status active
primitive workflows list --json
```

### Get Workflow Details

```bash
primitive workflows get <workflow-id>
primitive workflows get <workflow-id> --json
```

### Update Workflow Metadata

```bash
primitive workflows update <workflow-id> --name "New Name"
primitive workflows update <workflow-id> --status active
primitive workflows update <workflow-id> --per-user-max-running 10
```

### Delete/Archive Workflow

```bash
# Archive (soft delete)
primitive workflows delete <workflow-id>

# Permanently delete
primitive workflows delete <workflow-id> --hard --yes
```

### Monitor Runs

```bash
# List runs
primitive workflows runs list <workflow-id>
primitive workflows runs list <workflow-id> --status completed

# Get run status
primitive workflows runs status <workflow-id> <run-id>
```

### Manage Configurations

```bash
# List configurations
primitive workflows configs list <workflow-id>

# Get a configuration (includes steps)
primitive workflows configs get <workflow-id> <config-id>

# Create a new configuration
primitive workflows configs create <workflow-id> --name "production" --from-file workflow.toml

# Update a configuration's steps
primitive workflows configs update <workflow-id> <config-id> --from-file workflow.toml

# Activate a configuration
primitive workflows configs activate <workflow-id> <config-id>

# Duplicate a configuration
primitive workflows configs duplicate <workflow-id> <config-id> --name "experiment-v2"

# Archive a configuration (cannot archive the active config)
primitive workflows configs archive <workflow-id> <config-id>
```

### Test Cases

```bash
# List test cases
primitive workflows tests list <workflow-id>

# Create test case
primitive workflows tests create <workflow-id> \
  --name "Basic test" \
  --vars '{"input":"hello"}' \
  --contains '["expected","strings"]'

# Run single test
primitive workflows tests run <workflow-id> <test-case-id>

# Run all tests
primitive workflows tests run-all <workflow-id>

# Upload test attachment
primitive workflows tests attachments upload <workflow-id> <test-case-id> ./file.pdf
```

---

## Client Library (JS SDK)

The `JsBaoClient` provides methods for interacting with workflows from application code.

### Start a Workflow

```typescript
const result = await client.workflows.start({
  workflowKey: "my-workflow",           // Required: workflow key
  input: { text: "hello" },            // Optional: root input (default: {})
  runKey: "unique-run-key",            // Optional: idempotency key (auto-generated if omitted)
  contextDocId: "doc-id",             // Optional: document scope (default: user's root document)
  meta: { source: "api" },            // Optional: metadata (max 1KB)
  forceRerun: false,                   // Optional: terminate existing run with same key and restart
});

// result: { runId, runKey, instanceId, status, existing? }
```

**Notes on `runKey` and idempotency:**

- If a run with the same `runKey` already exists in the same `contextDocId` scope, the existing run is returned with `existing: true`
- Use `forceRerun: true` to terminate the existing run and start a new one
- The `runKey` is scoped: `${contextDocId}#${runKey}`

### Get Workflow Status

```typescript
const status = await client.workflows.getStatus({
  workflowKey: "my-workflow",
  runKey: "unique-run-key",
  contextDocId: "doc-id",             // Optional
});

// status: { status, output?, error?, run? }
// status.status: "complete" | "failed" | "terminated" | "running"
```

### Terminate a Workflow

```typescript
const result = await client.workflows.terminate({
  workflowKey: "my-workflow",
  runKey: "unique-run-key",
  contextDocId: "doc-id",             // Optional
});
```

### List Workflow Runs

```typescript
const runs = await client.workflows.listRuns({
  workflowKey: "my-workflow",          // Optional: filter by workflow
  status: "completed",                 // Optional: filter by status
  contextDocId: "doc-id",             // Optional: filter by document
  limit: 50,                          // Optional: page size (default: 50, max: 200)
  cursor: "...",                       // Optional: pagination cursor
  forward: false,                      // Optional: true = oldest first, false = newest first
});

// runs: { items: WorkflowRun[], cursor?: string }
```

### WorkflowRun Object

```typescript
interface WorkflowRun {
  runId: string;
  runKey: string;
  instanceId: string;
  workflowId: string;
  workflowKey: string;
  revisionId: string;
  contextDocId?: string;
  status: string;                      // "running" | "completed" | "failed" | "terminated"
  errorMessage?: string;
  startedAt: string;
  endedAt?: string;
  meta?: Record<string, any>;
  createdAt: string;
}
```

---

## WebSocket Events

Workflow events are broadcast via WebSocket in real-time. A WebSocket connection must be established (typically by opening a document) to receive events.

### `workflowStarted`

Fired when a workflow run begins execution.

```typescript
client.on("workflowStarted", (event) => {
  console.log(`Workflow ${event.workflowKey} started: run ${event.runKey}`);
});
```

**Payload:**

```typescript
{
  type: "workflowStarted";
  workflowKey: string;
  workflowId: string;
  runKey: string;
  runId: string;
  instanceId: string;
  contextDocId?: string;
  meta?: Record<string, any>;
}
```

### `workflowStatus`

Fired when a workflow run completes, fails, or is terminated.

```typescript
client.on("workflowStatus", (event) => {
  if (event.status === "completed") {
    console.log("Output:", event.output);
  } else if (event.status === "failed") {
    console.error("Error:", event.error);
  }
});
```

**Payload:**

```typescript
{
  type: "workflowStatus";
  workflowKey: string;
  workflowId: string;
  runKey: string;
  runId: string;
  status: "completed" | "failed" | "terminated";
  output?: any;                        // Present when status is "completed"
  error?: string;                      // Present when status is "failed"
  contextDocId?: string;
  needsApply?: boolean;                // True if workflow result needs client apply
}
```

**Notes:**

- Events are broadcast to all WebSocket connections for the user and for collaborators on the same document
- Requires an active WebSocket connection (established via `client.documents.open(docId)`)

---

## Workflow Apply Pattern

When a workflow completes, its result can be applied to a Yjs document by exactly one connected client. This prevents duplicate writes when multiple tabs or devices are connected to the same document.

### Using `onApply` (Recommended)

Register a handler with `workflows.onApply()` to automatically claim, apply, and confirm workflow results:

```typescript
client.workflows.onApply("my-workflow-key", async ({ output, workflowKey, runKey, contextDocId }) => {
  // Apply the workflow result to the Yjs document
  const { doc } = await client.documents.open(contextDocId);
  const map = doc.getMap("data");
  map.set("result", output);
});
```

### How It Works

1. Workflow completes → server sets status to `apply_pending`
2. All connected clients receive a `workflowStatus` event with `needsApply: true`
3. The first client to call `claimApply` wins (conditional DynamoDB update)
4. The claiming client runs the registered `onApply` handler
5. On success, `confirmApply` marks the run as `completed`
6. On failure, `releaseApply` releases the claim so another client can retry
7. A 30-second lease timeout handles crashed clients

The claim/confirm/release cycle is handled automatically when you use `workflows.onApply()`.

### Manual Claim/Confirm Flow

For more control, use the claim/confirm/release methods directly:

```typescript
const claim = await client.workflows.claimApply({
  workflowKey: "my-workflow-key",
  runKey: "run-123",
  contextDocId: "doc-456",
});

if (claim.claimed) {
  try {
    // Apply result to document...
    await client.workflows.confirmApply({
      workflowKey: "my-workflow-key",
      runKey: "run-123",
      contextDocId: "doc-456",
    });
  } catch (err) {
    await client.workflows.releaseApply({
      workflowKey: "my-workflow-key",
      runKey: "run-123",
      contextDocId: "doc-456",
    });
  }
}
```

### Apply Methods

| Method | Description |
| ------ | ----------- |
| `workflows.onApply(workflowKey, handler)` | Register handler for automatic claim/apply/confirm |
| `workflows.claimApply(options)` | Manually claim a pending apply |
| `workflows.confirmApply(options)` | Confirm apply succeeded |
| `workflows.releaseApply(options)` | Release claim on failure |

---

## Complete Examples

### Example 1: PDF Summarizer with Haiku

This workflow:

1. Summarizes a PDF using a managed prompt
2. Generates a haiku from the summary
3. Returns both as the final output

```toml
[workflow]
key = "pdf-haiku"
name = "PDF Haiku Generator"
description = "Summarizes a PDF and generates a haiku about its content"
status = "draft"
perUserMaxRunning = 4
perUserMaxQueued = 100
dequeueOrder = "fifo"

[[steps]]
id = "summarize-pdf"
kind = "prompt.execute"
promptKey = "pdf-summarizer"

[steps.variables]
attachments = "{{ input.attachments }}"

[[steps]]
id = "generate-haiku"
kind = "prompt.execute"
promptKey = "haiku-generator"

[steps.variables]
text = "{{ steps.summarize-pdf.content }}"

[[steps]]
id = "extract-content"
kind = "transform"
saveAs = "output"

[steps.output]
summary = "{{ steps.summarize-pdf.content }}"
haiku = "{{ steps.generate-haiku.content }}"
```

### Example 2: Conditional LLM Chain

This workflow:

1. Generates a headline with LLM
2. Conditionally rewrites it if too short

```toml
[workflow]
key = "headline-generator"
name = "Smart Headline Generator"
status = "draft"

[[steps]]
id = "first-llm"
kind = "llm.chat"
model = "gpt-4o-mini"

[[steps.messages]]
role = "user"
content = "Give me a one-line headline about {{ input.topic || 'technology' }}"

[[steps]]
id = "second-llm"
kind = "llm.chat"
model = "gpt-4o-mini"
runIf = "steps.first-llm.content < 120"   # Only run if first headline is short

[[steps.messages]]
role = "user"
content = "Rewrite this headline to be punchier: {{ steps.first-llm.content }}"

[[steps]]
id = "final"
kind = "transform"
saveAs = "output"

[steps.output]
headline = "{{ outputs.second-llm.content || steps.first-llm.content }}"
wasRewritten = "{{ outputs.second-llm.content }}"
```

### Example 3: External API Integration

This workflow:

1. Calls an external weather API
2. Transforms the response

```toml
[workflow]
key = "weather-check"
name = "Weather Checker"
status = "draft"

[[steps]]
id = "fetch-weather"
kind = "integration.call"
integrationKey = "weather-api"
saveAs = "weatherData"

[steps.request]
method = "GET"
path = "/current"

[steps.request.query]
city = "{{ input.city }}"
units = "metric"

[[steps]]
id = "format"
kind = "transform"
saveAs = "output"

[steps.output]
city = "{{ input.city }}"
temperature = "{{ outputs.weatherData.temp }}"
conditions = "{{ outputs.weatherData.description }}"
```

---

## CLI Workflow: Creating a New Workflow

### Step 1: Create the TOML file

Create a file named `my-workflow.toml`:

```toml
[workflow]
key = "my-workflow"
name = "My Workflow"
description = "Does something useful"
status = "draft"

[[steps]]
id = "step-1"
kind = "transform"
saveAs = "output"

[steps.output]
message = "Hello, {{ input.name || 'World' }}!"
```

### Step 2: Create the workflow

```bash
primitive workflows create --from-file my-workflow.toml
```

Note the workflow ID returned. A default configuration is automatically created.

### Step 3: Preview/test the workflow

```bash
primitive workflows preview <workflow-id> --input '{"name":"Agent"}' --wait
```

### Step 4: Iterate on the configuration

Edit `my-workflow.toml`, then update the configuration:

```bash
# List configs to get the config ID
primitive workflows configs list <workflow-id>

# Update the configuration's steps
primitive workflows configs update <workflow-id> <config-id> --from-file my-workflow.toml
```

Preview again to test changes.

### Step 5: Set to active

```bash
primitive workflows update <workflow-id> --status active
```

### Alternative: Publish via legacy revisions

If using the legacy revision flow:

```bash
# Publish the draft (creates immutable revision)
primitive workflows publish <workflow-id>

# Then set to active
primitive workflows update <workflow-id> --status active
```

---

## Common Patterns

### Pattern: Chain multiple LLM calls

```toml
[[steps]]
id = "analyze"
kind = "llm.chat"
model = "gpt-4o"
saveAs = "analysis"

[[steps.messages]]
role = "user"
content = "Analyze this text: {{ input.text }}"

[[steps]]
id = "summarize"
kind = "llm.chat"
model = "gpt-4o-mini"
saveAs = "summary"

[[steps.messages]]
role = "user"
content = "Summarize this analysis in 2 sentences: {{ outputs.analysis.content }}"
```

### Pattern: Pass attachments to prompts

```toml
[[steps]]
id = "process-file"
kind = "prompt.execute"
promptKey = "file-processor"

[steps.variables]
attachments = "{{ input.attachments }}"
instructions = "{{ input.instructions || 'Summarize the content' }}"
```

### Pattern: Fallback values for robustness

```toml
[[steps]]
id = "format"
kind = "transform"
saveAs = "output"

[steps.output]
title = "{{ input.title || 'Untitled Document' }}"
author = "{{ input.author || 'Unknown' }}"
content = "{{ steps.generate.content || '' }}"
```

### Pattern: Conditional processing

```toml
# Only run expensive processing if input meets criteria
[[steps]]
id = "expensive-step"
kind = "gemini.generate"
runIf = "input.processDeep"
# ...

# Use simple fallback if condition not met
[[steps]]
id = "simple-step"
kind = "transform"
runIf = "input.processDeep"   # Negation not supported, use separate logic
# ...
```

---

## Troubleshooting

### "Workflow not found"

- Verify the workflow ID or key is correct
- Ensure you're using the correct app context
- Verify the workflow has `status = "active"` (not `draft`)
- Ensure the workflow has an active configuration or published revision

### "Workflow has no draft or configuration to preview"

- Create a configuration: `primitive workflows configs create <workflow-id> --name "default" --from-file workflow.toml`
- Or update the draft: `primitive workflows draft update <workflow-id> --from-file workflow.toml`

### "Draft has no steps"

- Run `primitive workflows draft update` to add steps before preview/publish

### "Cannot activate workflow without a revision or active configuration"

- Create and activate a configuration first, or publish a revision
- `primitive workflows configs create <workflow-id> --name "default" --from-file workflow.toml`
- `primitive workflows configs activate <workflow-id> <config-id>`

### Template not resolving

- Check path exists in context (`input`, `steps`, `outputs`)
- Use fallback values: `{{ input.field || 'default' }}`
- Verify step IDs match exactly
- Check `templateWarnings` in step run results for unresolved variables

### runIf not working

- Only supports: truthy checks, `< number`, `||` fallback
- Does not support: `>`, `>=`, `<=`, `==`, `!=`, arithmetic

### Integration call failing

- Verify `integrationKey` matches a configured integration
- Check the integration is active
- Verify request path/method are correct

### Run returns `existing: true`

- A run with the same `runKey` in the same `contextDocId` scope already exists
- Use `forceRerun: true` to terminate the existing run and start a new one
- Or use a different `runKey`

---

## Limitations

1. **No loops**: Workflows execute steps sequentially only
2. **No branching**: Use `runIf` for conditional execution (no goto/jump)
3. **Limited expressions**: Only path access, fallbacks, and `< number` comparisons
4. **No custom functions**: No string manipulation, date functions, etc.
5. **No arithmetic**: Cannot do `{{ input.a + input.b }}`
6. **Sequential only**: Steps cannot run in parallel
7. **Concurrency limits**: Defined on workflow but not yet enforced by the runtime
8. **Run TTL**: Workflow runs and step runs are automatically cleaned up after 45 days (7 days for preview runs)
