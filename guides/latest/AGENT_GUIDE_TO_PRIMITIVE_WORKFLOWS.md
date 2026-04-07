# Workflow Agent Guide

This guide explains the workflow syntax and CLI commands for creating and managing workflows in the js-bao platform. It is designed for coding agents to understand and implement workflows. Workflows are configured using TOML config files and the `primitive sync` command to keep configuration version-controlled alongside your code.

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

## Managing Workflows with Config Files (Recommended)

All workflow configuration is managed through TOML config files and the `primitive sync` command. This keeps configuration version-controlled alongside your code.

```bash
primitive sync init --dir ./config    # Initialize config directory
primitive sync pull --dir ./config    # Pull current config from server
primitive sync diff --dir ./config    # Preview changes
primitive sync push --dir ./config    # Push local config to server
primitive sync push --dir ./config --dry-run  # See what would change without applying
```

The config directory structure:

```
config/
  workflows/
    my-workflow.toml
    another-workflow.toml
```

### Creating a Workflow via Sync

1. Create a TOML file in `config/workflows/`:

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

2. Push to the server:

```bash
primitive sync push --dir ./config --dry-run  # Preview changes
primitive sync push --dir ./config            # Apply
```

This creates the workflow and a default configuration automatically.

3. Preview/test the workflow:

```bash
primitive workflows preview <workflow-id> --input '{"name":"Agent"}' --wait
```

4. When ready, set `status = "active"` in the TOML file and push again:

```bash
primitive sync push --dir ./config
```

### Updating a Workflow via Sync

```bash
# 1. Pull latest configuration
primitive sync pull --dir ./config

# 2. Edit the TOML file
vim config/workflows/my-workflow.toml

# 3. Preview and push changes
primitive sync push --dir ./config --dry-run  # Preview
primitive sync push --dir ./config            # Apply
```

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

Configurations are the recommended way to manage workflow steps. When you create a workflow via `primitive sync push`, a default configuration is automatically created.

1. **Create the workflow** by adding a TOML file and running `primitive sync push`
2. **Set `status = "active"`** in the TOML file and push again

To update steps, edit the TOML file and run `primitive sync push` again.

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

**Note:** Setting `status = "active"` in the TOML file will fail with "Cannot activate workflow without a revision or active configuration" if you haven't published or created a configuration first.

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

# Access control (optional)
accessRule = "hasRole('admin')"       # CEL expression restricting who can start this workflow

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

## Access Control

The `accessRule` field accepts a CEL expression that controls who can start a workflow. It is evaluated when:

- A client calls `client.workflows.start()`
- A `workflow.call` step invokes the workflow from another workflow

It is **not** evaluated when a workflow is triggered via an inbound webhook — webhook-triggered runs bypass the access rule because the webhook endpoint handles its own authentication (e.g., Stripe signature verification).

**Behavior:**

- **No rule** (omitted or empty): any authenticated app member can start the workflow
- **Admin/owner**: always bypass the access rule regardless of the expression
- **Other roles**: the CEL expression is evaluated against the user's context

**Available CEL context:**

| Variable | Description |
|---|---|
| `user.userId` | The user's ID |
| `user.role` | The user's app role (`owner`, `admin`, `member`) |

**Available CEL functions:**

| Function | Description |
|---|---|
| `hasRole(role)` | Returns `true` if the user has the specified app role |
| `isMemberOf(groupType, groupId)` | Returns `true` if the user belongs to the specified group |
| `memberGroups(groupType)` | Returns the list of group IDs the user belongs to for a group type |

**Examples:**

```toml
[workflow]
key = "admin-report"
accessRule = "hasRole('admin')"           # Only admins (and owners) can start
```

```toml
[workflow]
key = "team-action"
accessRule = "isMemberOf('team', 'engineering')"  # Only engineering team members
```

**Security guidance for webhook workflows:** If a workflow is triggered by an inbound webhook (e.g., Stripe, GitHub), add a restrictive `accessRule` to prevent clients from calling `client.workflows.start()` directly with a crafted payload, bypassing webhook signature verification:

```toml
[workflow]
key = "stripe-webhook"
name = "Stripe Webhook Handler"
status = "active"
accessRule = "hasRole('owner')"  # Prevent direct client starts — only webhook triggers
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

Calls the internal LLM service (via OpenRouter).

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
# top_p = 0.9
```

**Additional parameters:**

| Parameter      | Type     | Description                              |
| -------------- | -------- | ---------------------------------------- |
| `temperature`  | number   | Sampling temperature (0-2)               |
| `top_p`        | number   | Nucleus sampling parameter               |
| `attachments`  | array    | File attachments for multimodal input     |
| `plugins`      | array    | Plugin configurations                     |
| `tools`        | object   | Tool/function calling definitions         |
| `tool_choice`  | object   | Tool selection strategy                   |

**Note:** `maxTokens` is not supported on `llm.chat` steps. To control max tokens, use a managed prompt (`prompt.execute`) with a prompt configuration that sets `maxTokens`.

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
thinkingLevel = "minimal"   # Optional: minimal | low | medium | high (Gemini 3 only)

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
# bodyMode = "json"              # Optional: json | raw | multipart (default: json)

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

**Additional parameters:**

| Parameter         | Type   | Description                                          |
| ----------------- | ------ | ---------------------------------------------------- |
| `integrationKey`  | string | Required. Key of the configured integration          |
| `request`         | object | Request configuration (method, path, headers, query, body) |
| `attachments`     | array  | File attachments: `[{ name, type, data }]`           |
| `bodyMode`        | string | Body encoding: `json` (default), `raw`, `multipart`  |
| `multipartFields` | array  | Multipart field definitions (for `bodyMode = "multipart"`) |

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

### 11. `database.query` - Query Database

Runs a registered database query operation.

```toml
[[steps]]
id = "fetch-users"
kind = "database.query"
databaseId = "{{ input.dbId }}"
operationName = "listActiveUsers"
limit = 50
saveAs = "users"

[steps.params]
status = "active"
```

**Output:** `{ data: [...], hasMore: boolean, nextCursor?: string }`

### 12. `database.mutate` - Mutate Database

Runs a registered database mutation operation.

```toml
[[steps]]
id = "save-record"
kind = "database.mutate"
databaseId = "{{ input.dbId }}"
operationName = "createTask"

[steps.params]
title = "{{ input.title }}"
assignee = "{{ steps.lookup.userId }}"
```

**Output:** `{ results: [{ success: boolean, id: string }] }`

### 13. `database.count` / `database.aggregate` / `database.pipeline`

Other registered database operations:

```toml
[[steps]]
id = "count-active"
kind = "database.count"
databaseId = "{{ input.dbId }}"
operationName = "countByStatus"

[steps.params]
status = "active"
# Output: { count: 42 }
```

### 14. `group.addMember` / `group.removeMember`

Manage group membership. Idempotent — add is a no-op if already a member, remove is a no-op if not.

```toml
[[steps]]
id = "add-to-team"
kind = "group.addMember"
groupType = "team"
groupId = "{{ input.teamId }}"
userId = "{{ input.userId }}"
```

**Output:** `{ userId, groupType, groupId, addedBy }` or `{ ..., alreadyMember: true }`

Group operations evaluate CEL rules on the group type. Workflows can be granted access via `fromWorkflow("workflowKey")` in CEL rules.

### 15. `group.checkMembership`

Check if a user belongs to a group. Useful for conditional branching with `runIf`.

```toml
[[steps]]
id = "is-reviewer"
kind = "group.checkMembership"
groupType = "reviewers"
groupId = "senior"
userId = "{{ input.userId }}"

[[steps]]
id = "approve"
kind = "database.mutate"
runIf = "steps.is-reviewer.isMember"
# ...
```

**Output:** `{ isMember: boolean, userId, groupType, groupId }`

### 16. `group.listMembers`

Paginated list of group members.

```toml
[[steps]]
id = "team-members"
kind = "group.listMembers"
groupType = "team"
groupId = "engineering"
limit = 100
includeUserDetails = true
```

**Output:** `{ items: [{ userId, addedAt, addedBy, userName?, userEmail? }], cursor? }`

### 17. `group.listUserMemberships`

List all groups a user belongs to.

```toml
[[steps]]
id = "user-groups"
kind = "group.listUserMemberships"
userId = "{{ input.userId }}"
groupType = "team"              # Optional filter
```

**Output:** `{ memberships: [{ groupType, groupId, addedAt, addedBy }] }`

### 18. `collect` - Auto-paginate

Auto-paginates a data source and merges all pages.

```toml
[[steps]]
id = "all-users"
kind = "collect"
itemsField = "data"             # Field containing items in each page (default: "items")
cursorField = "nextCursor"      # Field containing the cursor (default: "cursor")
maxPages = 20                   # Max pages to fetch (default: 10)
maxItems = 10000                # Max total items (default: 10000)

[steps.step]
kind = "database.query"
databaseId = "{{ input.dbId }}"
operationName = "listUsers"
limit = 100
```

**Output:** `{ items: [...all pages merged...], totalPages: number }`

### 19. `workflow.call` - Call Child Workflow (Sequential)

Run another workflow inline (synchronously). The child workflow gets its own isolated `input` — it cannot access the parent's `steps` or `outputs`.

```toml
[[steps]]
id = "onboard-user"
kind = "workflow.call"
workflowKey = "onboard-user"

[steps.input]
userId = "{{ item.userId }}"
department = "{{ input.department }}"
```

**Output:** `{ output: <child workflow output>, childStepResults: [...] }`

Works with `forEach` for sequential per-item processing.

### 20. `workflow.start` - Start Child Workflows (Parallel)

Start child workflow instances in parallel. Each creates an independent workflow instance.

```toml
[[steps]]
id = "start-all"
kind = "workflow.start"
forEach = "steps.get-users.data"
as = "user"
workflowKey = "process-item"

[steps.input]
userId = "{{ user.id }}"
```

**Output** (per instance): `{ runId, instanceId, workflowKey, status: "running" }`

With `forEach`, returns `{ items: [...], errors: [], totalSucceeded, totalFailed }`.

### 21. `workflow.await` - Wait for Child Workflows

Wait for child workflow instances to complete.

```toml
[[steps]]
id = "results"
kind = "workflow.await"
runs = "steps.start-all"        # Path to array from workflow.start
timeout = 300000                # 5 minutes (default: 600000)
onPartialFailure = "continue"   # or "fail" (default)
```

**Output:** `{ completed: [{ runId, instanceId, output }], failed: [{ runId, instanceId, error }], allSucceeded: boolean }`

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

### Filters

Use `|` (single pipe) to apply a filter to a value. Filters transform the resolved value before output. Do not confuse with `||` (double pipe) which is the fallback operator.

```toml
# Format as JSON
debug = "{{ input.data | json }}"

# String transformations
upper = "{{ input.name | upper }}"
lower = "{{ input.name | lower }}"
trimmed = "{{ input.text | trim }}"

# Collection operations
count = "{{ input.items | length }}"
first = "{{ input.items | first }}"
last = "{{ input.items | last }}"
allKeys = "{{ input.data | keys }}"
allValues = "{{ input.data | values }}"
joined = "{{ input.tags | join: ', ' }}"

# Type conversion
asString = "{{ input.count | string }}"
asNumber = "{{ input.amount | number }}"

# Default value (works on null, undefined, or empty string)
name = "{{ input.name | default: 'Anonymous' }}"
```

**Available filters:**

**Array:**

| Filter      | Description                                       |
| ----------- | ------------------------------------------------- |
| `pluck`     | Extract a field from each object: `\| pluck: 'name'` |
| `where`     | Filter by field value: `\| where: 'status', 'active'` |
| `sort`      | Sort ascending by field: `\| sort: 'name'`        |
| `reverse`   | Reverse order                                     |
| `flatten`   | Flatten one level                                 |
| `uniq`      | Remove duplicates                                 |
| `compact`   | Remove null/undefined/empty/false values          |
| `slice`     | Slice: `\| slice: '0', '3'`                       |
| `first`     | First element                                     |
| `last`      | Last element                                      |
| `length`    | Count items (alias: `size`)                       |
| `join`      | Join into string: `\| join: ', '`                 |
| `keys`      | Object keys as array                              |
| `values`    | Object values as array                            |

**String:**

| Filter      | Description                                       |
| ----------- | ------------------------------------------------- |
| `upper`     | Uppercase (alias: `uppercase`)                    |
| `lower`     | Lowercase (alias: `lowercase`)                    |
| `trim`      | Trim whitespace                                   |
| `split`     | Split into array: `\| split: ','`                 |
| `replace`   | Replace all: `\| replace: 'old', 'new'`           |
| `truncate`  | Truncate with `...`: `\| truncate: '100'`         |
| `startsWith`| Returns boolean: `\| startsWith: 'prefix'`       |
| `endsWith`  | Returns boolean: `\| endsWith: 'suffix'`          |
| `contains`  | Returns boolean: `\| contains: 'substring'`      |

**Number:**

| Filter      | Description                                       |
| ----------- | ------------------------------------------------- |
| `round`     | Round to nearest integer                          |
| `floor`     | Round down                                        |
| `ceil`      | Round up                                          |
| `abs`       | Absolute value                                    |
| `toFixed`   | Format decimal places: `\| toFixed: '2'`          |

**Type / misc:**

| Filter      | Description                                       |
| ----------- | ------------------------------------------------- |
| `json`      | JSON-stringify the value (pretty-printed)          |
| `string`    | Convert to string                                  |
| `number`    | Convert to number                                  |
| `boolean`   | Convert to boolean                                |
| `default`   | Use fallback if null/undefined/empty: `\| default: 'fallback'` |
| `expect`    | Validate type, throw if mismatch: `\| expect: 'number'` (types: `string`, `number`, `boolean`, `array`, `object`) |
| `now`       | Current ISO timestamp                             |
| `toISOString` | Convert to ISO date string                      |

### Single Expression Mode

When the entire value is a single template expression, the raw value is preserved (arrays/objects are not stringified):

```toml
# Returns array, not "[object Object]"
items = "{{ input.itemsList }}"
```

## Conditional Execution (`runIf`)

Each step can include a `runIf` CEL expression to control execution.

```toml
[[steps]]
id = "optional-step"
kind = "transform"
runIf = "input.shouldRun"               # Truthy check

[[steps]]
id = "short-content-step"
kind = "transform"
runIf = "outputs.text.length < 1000"   # Comparison

[[steps]]
id = "approve"
kind = "database.mutate"
runIf = 'steps.check.isMember == true && input.amount > 0'  # Full CEL
```

CEL context includes: `input`, `selected`, `steps`, `outputs`, `meta`.

## `forEach` — Iteration

Any step can use `forEach` to run once per item in a list:

```toml
[[steps]]
id = "notify-each"
kind = "integration.call"
forEach = "steps.get-team.items"
as = "member"
integrationKey = "email"

[steps.request.body]
to = "{{ member.userEmail }}"
subject = "Update: {{ input.title }}"
```

**Output shape** — forEach always returns a consistent object:

```json
{
  "items": [result1, result2, ...],
  "errors": [],
  "totalSucceeded": 3,
  "totalFailed": 0
}
```

Access the results with `steps.notify-each.items`.

**Loop context variables** (in templates):

| Variable | Description |
|----------|-------------|
| `{{ member }}` | Current item (name from `as`) |
| `{{ loop.index }}` | Zero-based index |
| `{{ loop.count }}` | Total items |
| `{{ loop.first }}` | True on first iteration |
| `{{ loop.last }}` | True on last iteration |

**CEL runIf per iteration** — use `iteration` (not `loop`, which is reserved in CEL):

```toml
[[steps]]
id = "process-active"
kind = "transform"
forEach = "steps.data"
as = "item"
runIf = "item.active && iteration.index < 100"
output = "{{ item.name }}"
```

**Limits:** Default 200 items max. Override with `maxItems = 1000`.

## Error Handling

### `continueOnError`

By default, a step failure stops the workflow. Set `continueOnError = true` to capture the error and continue:

```toml
[[steps]]
id = "risky-call"
kind = "integration.call"
continueOnError = true
# ...

[[steps]]
id = "handle-result"
kind = "transform"
saveAs = "output"

[steps.output]
success = "{{ steps.risky-call.error == null }}"
data = "{{ steps.risky-call.data || 'fallback' }}"
```

When a step fails with `continueOnError`:
- `steps[id]` contains `{ error: "message", errorDetails: "stack trace" }`
- Workflow continues to the next step

### `compensate` block

The `compensate` block runs when any step fails (without `continueOnError`). Use it to undo side effects:

```toml
[[steps]]
id = "deduct-token"
kind = "database.mutate"
# ...

[[steps]]
id = "call-api"
kind = "integration.call"
# if this fails, compensate runs

[[compensate]]
id = "restore-token"
kind = "database.mutate"
runIf = "steps.deduct-token != null"
# ...
```

Compensate steps have access to `steps._error.message` and `steps._error.stepId`.

### `strict` mode

Add `strict = true` to a step to turn unresolved template expressions into hard errors:

```toml
[[steps]]
id = "send-email"
kind = "integration.call"
strict = true

[steps.request.body]
to = "{{ input.recipientEmail }}"
subject = "{{ input.titl }}"     # Typo → throws with clear message
```

### `expect` filter (type validation)

Validate that a template expression resolves to a specific type:

```toml
[[steps]]
id = "process-order"
kind = "transform"

[steps.output]
orderId = "{{ input.orderId | expect: 'string' }}"
amount = "{{ input.amount | expect: 'number' }}"
items = "{{ input.lineItems | expect: 'array' }}"
```

Supported types: `string`, `number`, `boolean`, `array`, `object`. Throws immediately if the type doesn't match.

### Step input validation

Required fields are automatically validated after template rendering. If a required field resolves to an empty string (e.g., from a missing template path), the step throws:

```
Step "query": required field "databaseId" is empty (resolved to "").
Check that the template expression "{{ input.dbId }}" resolves correctly.
```

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
# Create via sync (recommended)
primitive sync push --dir ./config

# Create from TOML file (alternative)
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

# View step-level details for a run
primitive workflows runs steps <workflow-id> <run-id>

# Full detail for one step (config, input, output, error, context)
primitive workflows runs step-detail <workflow-id> <run-id> <step-id>

# Quick error summary for a failed run
primitive workflows runs error <workflow-id> <run-id>

# List recent failures
primitive workflows runs failures <workflow-id>
```

### Analytics

```bash
# Performance analytics overview
primitive workflows analytics overview --days 7

# Top workflows by usage
primitive workflows analytics top --days 7
```

All debugging commands support `--json` for machine-readable output.

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

**Note:** The getting-started guide shows a simplified call signature (e.g., `client.workflows.start("key", { input })`). The actual SDK uses an options object as shown below. Always prefer the signatures documented here, which match the source code.

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
// status.status: "running" | "complete" | "failed" | "terminated" | "apply_pending" | "apply_claimed"
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
  createdAt: string;
  endedAt?: string;
  meta?: Record<string, any>;          // User-defined metadata (max 1KB)
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
  startedByUserId?: string;            // User ID that started the workflow
  meta?: Record<string, any>;          // User-defined metadata
}
```

**Notes:**

- Events are broadcast to all WebSocket connections for the user and for collaborators on the same document
- Requires an active WebSocket connection (established via `client.documents.open(docId)`)

---

## Workflow Apply Pattern

When a workflow completes, you may need to run client-side follow-up logic exactly once — such as updating a document or syncing local state. The apply pattern guarantees that exactly one connected client executes this logic, even when multiple tabs or devices are connected simultaneously.

### Using `workflows.define()` (Recommended)

Register a client-side handler with `workflows.define()` to automatically claim, apply, and confirm workflow results:

```typescript
client.workflows.define("my-workflow-key", {
  onApply: async ({ output, workflowKey, runKey, runId, contextDocId, startedByUserId, meta }) => {
    // Run any client-side logic that should happen exactly once after the workflow completes.
    // For example: update a document, refresh local state, notify the UI, etc.
    const { doc } = await client.documents.open(contextDocId);
    const map = doc.getMap("data");
    map.set("result", output);
  },
});
```

### How It Works

1. Workflow completes → server sets status to `apply_pending`
2. All connected clients receive a `workflowStatus` event with `needsApply: true`
3. The first client to call `claimApply` wins — only one client gets the claim
4. The claiming client runs the registered `onApply` handler
5. On success, `confirmApply` marks the run as `completed`
6. On failure, `releaseApply` releases the claim so another client can retry
7. A 30-second lease timeout handles crashed clients

The claim/confirm/release cycle is handled automatically when you use `workflows.define()`.

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
    // Run your apply logic here...
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
| `workflows.define(workflowKey, { onApply })` | Register handler for automatic claim/apply/confirm |
| `workflows.claimApply(options)` | Manually claim a pending apply |
| `workflows.confirmApply(options)` | Confirm apply succeeded |
| `workflows.releaseApply(options)` | Release claim on failure |
| `workflows.getPendingApplies({ contextDocId })` | Fetch pending applies for a document |

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

### Step 1: Initialize config directory (if not already done)

```bash
primitive sync init --dir ./config
```

### Step 2: Create the TOML file

Create `config/workflows/my-workflow.toml`:

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

### Step 3: Push to server

```bash
primitive sync push --dir ./config --dry-run  # Preview changes
primitive sync push --dir ./config            # Apply
```

A default configuration is automatically created.

### Step 4: Preview/test the workflow

```bash
primitive workflows preview <workflow-id> --input '{"name":"Agent"}' --wait
```

### Step 5: Iterate

Edit `config/workflows/my-workflow.toml`, then push again:

```bash
primitive sync push --dir ./config
```

Preview again to test changes.

### Step 6: Set to active

Update `status = "active"` in the TOML file, then push:

```bash
primitive sync push --dir ./config
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

- Uses CEL expressions: supports truthy checks, comparisons (`<`, `>`, `==`, `!=`), `&&`, `||`
- Template expressions (`{{ }}`) are NOT supported inside `runIf` — use CEL path syntax directly (e.g., `steps.check.isMember` not `{{ steps.check.isMember }}`)
- Arithmetic (e.g., `+`, `-`) is not supported in templates, but comparisons work in CEL runIf

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

1. **No branching**: Use `runIf` for conditional execution (no goto/jump)
2. **No arithmetic in templates**: Cannot do `{{ input.a + input.b }}` (use `transform` step to reshape data first)
3. **forEach is sequential**: Each iteration runs one at a time (use `workflow.start` + `workflow.await` for true parallelism)
4. **Run TTL**: Workflow runs and step runs are automatically cleaned up after 45 days (7 days for preview runs)
5. **forEach maxItems**: Default 200 iterations per step; increase with `maxItems`
