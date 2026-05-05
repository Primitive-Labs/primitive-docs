# Working with Databases in the Primitive platform (js-bao-wss-client)

Guidelines for building apps with Primitive's server-side database storage.

## Core Concept: Databases

A **database** is:

1. A server-side data store backed by a Cloudflare Durable Object with SQLite
2. Accessed through server-configured **registered operations** with CEL-based access control
3. Schemaless — save any JSON records without upfront schema definition

**Properties:**

- Each database is an isolated Durable Object with its own SQLite instance — Strong consistency, zero-config scaling
- All data access goes through **registered operations** with per-operation authorization
- Databases can be organized by **type** — a named configuration shared across many database instances
- Supports queries, mutations, counts, aggregates, multi-step pipelines, atomic operations, batch writes, apply-to-query, and real-time subscriptions

**Size Guidelines:** Individual databases can hold up to ~5GB of data. For larger needs, split data across multiple databases (one per tenant, project, or domain) — each is a separate Durable Object that scales independently.

## When to Use Databases vs. Documents

Primitive offers two storage options: **documents** (local-first, real-time collaborative) and **databases** (server-side, fine-grained access control). Many apps use both — documents for personal/collaborative data, databases for app-wide shared data.

See the [Data Modeling guide](AGENT_GUIDE_TO_PRIMITIVE_DATA_MODELING.md) for a full decision framework, comparison table, and example app architectures.

## Quick Start

Database setup has two phases: **configuration** (via CLI and TOML config files) and **runtime usage** (via client library).

### 1. Configure database types and operations via CLI

Initialize a sync directory and create config files:

```bash
primitive sync init --dir ./config
```

Create a database type config with operations in `config/database-types/project.toml`:

```toml
[type]
databaseType = "project"
celContextAccess = "isMemberOf('team', database.celContext.teamId)"

[triggers.tasks]
triggers = [
  { on = "create", set = { createdAt = "now()", createdBy = "user.userId" } },
  { on = "update", set = { modifiedAt = "now()" } },
]

[[operations]]
name = "listTasks"
type = "query"
modelName = "tasks"
access = "isMemberOf('team', database.metadata.teamId)"
definition = '{"filter":{"projectId":"$params.projectId"},"sort":{"createdAt":-1},"limit":50}'
params = '{"projectId":{"type":"string","required":true}}'

[[operations]]
name = "createTask"
type = "mutation"
modelName = "tasks"
access = "isMemberOf('team', database.metadata.teamId)"
definition = '{"operations":[{"op":"save","data":{"title":"$params.title","projectId":"$params.projectId","status":"open","createdBy":"$user.userId","createdAt":"$now"}}]}'
params = '{"title":{"type":"string","required":true},"projectId":{"type":"string","required":true}}'
```

Push configuration to the server:

```bash
primitive sync push --dir ./config
```

### 2. Use databases in app code

```typescript
import { JsBaoClient } from "js-bao-wss-client";

const client = new JsBaoClient({ apiUrl, wsUrl, appId, token });

// Create a database instance of the configured type
const db = await client.databases.create({ title: "Alpha Project", databaseType: "project" });

// Execute registered operations
const result = await client.databases.executeOperation(db.databaseId, "listTasks", {
  params: { projectId: "proj-1" },
});

const createResult = await client.databases.executeOperation(db.databaseId, "createTask", {
  params: { title: "Ship v1", projectId: "proj-1" },
});
const taskId = createResult.results[0].id; // server-assigned ULID
```

## Configuring with the CLI

All database configuration — types, operations, triggers, rule sets, group types — is managed through TOML config files and the `primitive sync` command. This keeps configuration version-controlled alongside your code.

```bash
primitive sync init            # Initialize config dir (auto-resolves .primitive/sync/<env>/<appId>/)
primitive sync pull            # Pull current config from server
primitive sync diff            # Preview changes
primitive sync push            # Push local config to server
primitive sync push --dry-run  # See what would change without applying
# Override with a fixed path (legacy):
primitive sync init --dir ./config
primitive sync push --dir ./config
```

The config directory structure:

```
config/
  database-types/*.toml           # Database type configs + operations
  rule-sets/*.toml                # Access rule sets (CEL rules)
  group-type-configs/*.toml       # Group type configs
```

### Database type config files

Each file in `database-types/` defines a database type with its triggers and operations.

**TOML quoting tip:** CEL expressions containing apostrophes (e.g., `isMemberOf('class-teachers', database.id)`) must use triple-quoted strings in TOML, because single-quoted TOML strings don't support escaping. Use `'''...'''` for literal strings or `"""..."""` for basic strings:

```toml
# WRONG — TOML parse error due to apostrophes in single-quoted string:
access = 'isMemberOf('team', database.metadata.teamId)'

# CORRECT — triple-quoted literal string:
access = '''isMemberOf('team', database.metadata.teamId)'''

# ALSO CORRECT — double-quoted string with escaped quotes or no apostrophes:
access = "isMemberOf('team', database.metadata.teamId)"
```

Note: Double-quoted strings (`"..."`) also work for CEL with single quotes inside, since TOML only requires escaping the quote character that delimits the string.

**File:** `config/database-types/project.toml`

```toml
[type]
databaseType = "project"
ruleSetName = "project-admin-rules"    # optional — rule set for managing this type's config
celContextAccess = "isMemberOf('team', database.celContext.teamId)"  # optional — CEL for CEL context updates

[triggers.tasks]
triggers = [
  { on = "create", set = { createdAt = "now()", createdBy = "user.userId" } },
  { on = "update", set = { modifiedAt = "now()" } },
  { on = "save", when = "record.status == 'done' && record.completedAt == null", set = { completedAt = "now()" } },
]

[[operations]]
name = "listTasks"
type = "query"
modelName = "tasks"
access = "isMemberOf('team', database.metadata.teamId)"
definition = '{"filter":{"projectId":"$params.projectId"},"sort":{"createdAt":-1},"limit":50,"projection":{"title":1,"status":1}}'
params = '{"projectId":{"type":"string","required":true}}'

[[operations]]
name = "createTask"
type = "mutation"
modelName = "tasks"
access = "isMemberOf('team', database.metadata.teamId)"
definition = '{"operations":[{"op":"save","data":{"title":"$params.title","projectId":"$params.projectId","status":"open","createdBy":"$user.userId","createdAt":"$now"}}]}'
params = '{"title":{"type":"string","required":true},"projectId":{"type":"string","required":true}}'

[[operations]]
name = "countOpenTasks"
type = "count"
modelName = "tasks"
access = "isMemberOf('team', database.metadata.teamId)"
definition = '{"filter":{"projectId":"$params.projectId","status":"open"}}'
params = '{"projectId":{"type":"string","required":true}}'

[[operations]]
name = "tasksByStatus"
type = "aggregate"
modelName = "tasks"
access = "isMemberOf('team', database.metadata.teamId)"
definition = '{"groupBy":["status"],"operations":[{"type":"count","outputField":"total"},{"type":"sum","field":"estimatedHours","outputField":"totalHours"}],"filter":{"projectId":"$params.projectId"},"sort":{"field":"total","direction":-1},"limit":10}'
params = '{"projectId":{"type":"string","required":true}}'

[[operations]]
name = "projectDashboard"
type = "pipeline"
modelName = "_pipeline"
access = "isMemberOf('team', database.metadata.teamId)"
definition = '{"steps":[{"name":"recentTasks","type":"query","modelName":"tasks","filter":{"projectId":"$params.projectId"},"sort":{"createdAt":-1},"limit":5},{"name":"statusBreakdown","type":"aggregate","modelName":"tasks","filter":{"projectId":"$params.projectId"},"groupBy":["status"],"operations":[{"type":"count","outputField":"total"}]},{"name":"openBugs","type":"count","modelName":"tasks","filter":{"projectId":"$params.projectId","label":"bug","status":"open"}}],"return":"all"}'
params = '{"projectId":{"type":"string","required":true}}'
```

### Rule set config files

Rule sets define CEL-based access rules for managing database type configuration and group operations.

**File:** `config/rule-sets/project-admin-rules.toml`

```toml
[ruleSet]
name = "project-admin-rules"
resourceType = "database_type"
description = "Controls who can manage project database type config and operations"

[rules.config]
edit = "hasRole('admin')"

[rules.operations]
create = "hasRole('admin')"
edit = "hasRole('admin')"
delete = "hasRole('admin')"
```

### Group type config files

Group types configure how groups behave. See the [Users and Groups guide](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md) for full group documentation.

**File:** `config/group-type-configs/team.toml`

```toml
[groupTypeConfig]
groupType = "team"
ruleSetName = "team-rules"     # optional — rule set for group management
autoAddCreator = true          # auto-add creator as member (default: true)
```

### CLI commands for direct database management

Beyond sync, the CLI exposes commands for one-off ops (use `--help` for full flags):

```bash
primitive database-types list | get <type> | operations list <type>
primitive databases list | get <id> | create "Title" --type <type> [--cel-context '{...}'] | delete <id>
primitive databases cel-context update <id> --data '{"teamId":"team-1"}'

# Admin record introspection
primitive databases records models <id>
primitive databases records describe <id> <model>
primitive databases records query <id> <model> --filter '{"status":"open"}'

# Data migration (records + indexes + constraints; type config excluded — run sync push on target first)
primitive databases export <id> --output ./out
primitive databases import ./out --overwrite [--dry-run]
```

## Database Types

A **database type** is a named configuration shared across many databases. It provides:

- **Registered operations** (`type` is one of `query`, `mutation`, `count`, `aggregate`, `pipeline`, `applyToQuery`) with per-operation CEL `access`
- **Triggers** — computed fields evaluated in the DO before each save
- **`celContextAccess`** (formerly `metadataAccess`) — CEL expression that lets non-owner/manager users **read and update** the database's CEL context (defaults to deny when unset; owner/manager always have access). Both names are accepted; `celContextAccess` is preferred.
- **Rule set attachment** — controls who can edit the type config and its operations

Real-time subscriptions are configured **per-database**, not on the type — see [Real-Time Subscriptions](#real-time-subscriptions).

### Triggers

Triggers are computed fields that run server-side in the Durable Object before a record is saved. Configured per model in the `[triggers.<modelName>]` block of the database type TOML.

**Trigger fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `on` | string | Yes | When to fire: `"create"`, `"update"`, or `"save"` (both) |
| `when` | string | No | CEL boolean expression — trigger only fires if true. Errors → trigger does not fire (silent deny) |
| `set` | object | Yes | Map of field name to CEL expression. Each expression is evaluated and assigned. If the expression errors, the field is NOT set (returns `undefined`) |

**Trigger CEL context** (note: bare CEL expressions, NOT `$` substitution syntax):

| Variable | Description |
|----------|-------------|
| `user.userId` | The user performing the save |
| `user.role` | The user's app role |
| `record.*` | The record being saved (current field values) |
| `database.id` | The database ID |
| `database.celContext.*` | The database's CEL context object (also accessible as `database.metadata.*`) |
| `secrets.*` | App secrets (loaded only when expression references `secrets.`) |
| `now()` | Current ISO 8601 timestamp |
| `lookup(modelName, id)` | Load another record by ID; returns `null` if missing |
| `isMemberOf(groupType, groupId)`, `memberGroups(groupType)`, `hasRole(role)` | Membership/role checks |
| `fromWorkflow()`, `fromWorkflow(key)` | True if the write was issued by a workflow step (or a specific workflow) |

**Don't confuse trigger CEL with operation substitutions.** Triggers use bare CEL — `user.userId`, `now()`. Operation `definition` and `params` use `$user.userId`, `$now`, `$params.x`, `$database.celContext.x` substitutions, which are deep string-replacement on the JSON template, NOT CEL. (`$database.metadata.x` is accepted as a legacy alias.)

## Registered Operations

Registered operations are named, parameterized database operations defined at the database-type level. They are the primary data access layer — all user interaction with database data goes through operations.

### Access control model

- **All end-user data access** goes through registered operations, controlled by each operation's `access` CEL expression
- **Owner/manager** are administrative roles for managing the database itself — not for granting end-user access (see [Permissions](#permissions))
- If no operations are registered, non-owner/manager users are denied access entirely

### CEL access expressions

Each operation has an `access` field — a CEL expression evaluated at call time:

```
"true"                                             // all authenticated users
"hasRole('admin')"                                 // app admins only
"isMemberOf('team', database.celContext.teamId)"   // team members
"user.userId == params.userId"                     // only your own data
```

**CEL context variables:** `user.userId`, `user.role`, `database.id`, `database.celContext`, `database.metadata`, `params.*`

Only `database.id` and the CEL context object are available in CEL — other database fields like `createdBy` are not exposed. `database.celContext` and `database.metadata` are aliases for the same object; prefer `database.celContext` in new code. To check ownership, store the creator's ID in metadata at creation time or use group membership.

**CEL functions:** `isMemberOf(groupType, groupId)`, `memberGroups(groupType)`, `hasRole(role)`

For group-based access patterns, per-parameter access, and detailed CEL examples, see the [Users and Groups guide](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md).

### Parameters

Declare parameters callers must provide. In TOML, `params` is a JSON string:

```toml
params = '{"projectId":{"type":"string","required":true},"status":{"type":"string"}}'
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | One of `"string"`, `"number"`, `"boolean"`, `"object"` |
| `required` | no | Default `false`. If `true`, request fails 400 when missing |
| `access` | no | CEL expression evaluated against the caller's value (bound as `value`); false → 403 |
| `coerce` | no | Default `true`. If `false`, type-mismatched inputs are rejected instead of being coerced |

By default, scalar mismatches are coerced where safe (`"42"` → `42` for type `"number"`, `"true"` → `true` for type `"boolean"`, etc.). Undeclared params (not in the schema) are rejected with 400.

**Per-parameter access control** restricts what value a caller may pass:

```json
{
  "params": {
    "studentId": {
      "type": "string",
      "required": true,
      "access": "value in memberGroups('parent-of')"
    }
  }
}
```

### Substitution variables

Used **as string values inside operation definitions** (filter values, data fields, IDs, modelName). Substitution is a literal deep string-replacement on the JSON template — it is NOT CEL.

| Variable | Resolves to |
|----------|-------------|
| `$user.userId` | Current user's ID |
| `$now` | Current ISO 8601 timestamp |
| `$database.id` | The database instance ID |
| `$database.celContext.key` | Value from database CEL context (`null` if key missing) — `$database.metadata.key` is a legacy alias |
| `$params.fieldName` | Caller-provided parameter (`undefined` if not passed) |
| `$steps.stepName.<accessor>` | Pipeline cross-step reference (see Pipelines) |

**Missing-value rule (critical):** if a substitution resolves to `undefined` (e.g. an optional param the caller didn't pass), `JSON.stringify` drops the surrounding key entirely. The resulting filter / data object simply doesn't have that key — it is NOT set to `null` or empty string. Any value the caller actually passes (including `""`, `0`, `false`, explicit `null`) flows through verbatim.

This is how optional filters work: declare `{required: false}` and the filter narrows when the param is provided, matches all when it isn't.

```toml
[[operations]]
name = "listPosts"
type = "query"
modelName = "posts"
access = "true"
definition = '{"filter":{"status":"approved","authorId":"$params.authorId"},"sort":{"createdAt":-1},"limit":50}'
params = '{"authorId":{"type":"string","required":false}}'
```

| Caller input | Resolved filter |
|---|---|
| `{}` | `{"status":"approved"}` (all approved) |
| `{"authorId":"u-1"}` | `{"status":"approved","authorId":"u-1"}` |
| `{"authorId":""}` | `{"status":"approved","authorId":""}` (matches empty string — only `undefined` drops) |

> **Gotcha:** If a filter or data field references `$params.X` but `X` isn't declared in `params`, the substitution always resolves to `undefined` and the key silently drops — your operation becomes a match-all for that field, or your save omits the field entirely. The validator catches obvious cases at registration time, but always double-check the params schema covers every `$params.*` reference.

### Operation types

Operations are defined in the `[[operations]]` array in the database type TOML file. The `definition` and `params` fields are JSON strings.

#### Query — read records

```toml
[[operations]]
name = "listTasks"
type = "query"
modelName = "tasks"
access = "true"
definition = '{"filter":{"projectId":"$params.projectId"},"sort":{"createdAt":-1},"limit":50,"projection":{"title":1,"status":1}}'
params = '{"projectId":{"type":"string","required":true}}'
```

Definition fields: `filter` (required), `sort`, `limit` (1–1000), `projection`, `include`.

Callers can override `limit`, `cursor`, and `direction` at call time (effective limit is the lesser of definition and caller limits).

**Response:** `{ data: [...], hasMore: boolean, nextCursor?: string }`

#### Mutation — write records

Supports: `save`, `patch`, `delete`, `increment`, `addToSet`, `removeFromSet`.

```toml
[[operations]]
name = "createTask"
type = "mutation"
modelName = "tasks"
access = "isMemberOf('team', database.metadata.teamId)"
definition = '{"operations":[{"op":"save","data":{"title":"$params.title","status":"open","createdBy":"$user.userId","createdAt":"$now"}}]}'
params = '{"title":{"type":"string","required":true}}'
```

**Mutation operation types:**

| Op | Description | Key fields |
|----|-------------|------------|
| `save` | Create or replace a record | `data`, optional `ifNotExists`, `condition`, `stringSets`, `upsertOn` |
| `patch` | Partial update | `id`, `data` |
| `delete` | Remove a record | `id` |
| `increment` | Atomic numeric increment/decrement | `id`, `fields` |
| `addToSet` | Add values to StringSet fields | `id`, `stringSets` |
| `removeFromSet` | Remove values from StringSet fields | `id`, `stringSets` |

**Response:** `{ results: [{ success: true, id: "..." }] }`

**`upsertOn`** — pass `"upsertOn": "$params.email"` in a `save` op to create-or-update by a unique field value instead of requiring an explicit `id`. The server looks up a record where that field equals the provided value; if found, it patches it; if not, it inserts a new record. Useful for "ensure this user exists with these attributes" patterns:

```toml
[[operations]]
name = "ensureContact"
type = "mutation"
modelName = "contacts"
access = "hasRole('admin')"
definition = '{"operations":[{"op":"save","upsertOn":"$params.email","data":{"email":"$params.email","name":"$params.name","updatedAt":"$now"}}]}'
params = '{"email":{"type":"string","required":true},"name":{"type":"string","required":true}}'
```

#### Count — count matching records

```toml
[[operations]]
name = "countOpenTasks"
type = "count"
modelName = "tasks"
access = "true"
definition = '{"filter":{"projectId":"$params.projectId","status":"open"}}'
params = '{"projectId":{"type":"string","required":true}}'
```

**Response:** `{ count: 42 }`

#### Aggregate — group and compute

```toml
[[operations]]
name = "tasksByStatus"
type = "aggregate"
modelName = "tasks"
access = "true"
definition = '{"groupBy":["status"],"operations":[{"type":"count","outputField":"total"},{"type":"sum","field":"estimatedHours","outputField":"totalHours"},{"type":"avg","field":"estimatedHours","outputField":"avgHours"}],"filter":{"projectId":"$params.projectId"},"sort":{"field":"total","direction":-1},"limit":10}'
params = '{"projectId":{"type":"string","required":true}}'
```

Aggregate types: `count`, `sum`, `avg`, `min`, `max`.

**Response:** `{ result: { "open": { total: 15, totalHours: 120 }, ... } }`

#### Pipeline — multi-step read operations

Pipelines are **read-only** — they support `query`, `count`, and `aggregate` steps only. Mutations cannot be included in a pipeline. For server-side "query-then-mutate" in a single request, use `applyToQuery` instead (see below).

Pipelines execute multiple read-only steps with cross-step references:

```toml
[[operations]]
name = "projectDashboard"
type = "pipeline"
modelName = "_pipeline"
access = "isMemberOf('team', database.metadata.teamId)"
definition = '{"steps":[{"name":"recentTasks","type":"query","modelName":"tasks","filter":{"projectId":"$params.projectId"},"sort":{"createdAt":-1},"limit":5},{"name":"statusBreakdown","type":"aggregate","modelName":"tasks","filter":{"projectId":"$params.projectId"},"groupBy":["status"],"operations":[{"type":"count","outputField":"total"}]},{"name":"openBugs","type":"count","modelName":"tasks","filter":{"projectId":"$params.projectId","label":"bug","status":"open"}}],"return":"all"}'
params = '{"projectId":{"type":"string","required":true}}'
```

**Pipeline step references** — only these accessors exist (no `$steps.X.result`):

| Variable | Valid for step type | Resolves to |
|----------|---------------------|-------------|
| `$steps.X.first` | query | First record (object) or `null` |
| `$steps.X.first.fieldName` | query | A field from the first record, or `null` |
| `$steps.X.all.fieldName` | query | Array of that field across all records (filters out undefined) |
| `$steps.X.count` | query / count / aggregate | Record count, count value, or # of aggregate group keys |
| `$steps.X.results` | query / count / aggregate | Full data array, count number, or aggregate object |

**Response shape** depends on `return`:

- `"return": "all"` (default) → `{ steps: { stepName: { type, data | count | result } } }`
- `"return": "<stepName>"` → just that step's payload at top level (`{data}` for query, `{count}` for count, `{result}` for aggregate)

#### applyToQuery — server-side query+mutate

`applyToQuery` finds records matching a filter and applies a mutation action to every matched record in a single server-side request, eliminating the query-then-mutate round trip.

```toml
[[operations]]
name = "archiveCompleted"
type = "applyToQuery"
modelName = "tasks"
access = "hasRole('admin')"
definition = '{"source":{"filter":{"status":"completed","updatedAt":{"$lt":"$params.olderThan"}},"limit":500},"action":{"op":"patch","data":{"archived":true}}}'
params = '{"olderThan":{"type":"string","required":true}}'
```

Supported action ops: `delete`, `patch` (requires `data`), `increment` (requires `fields`), `addToSet`/`removeFromSet` (require `stringSets`).

**Limits and partial-mutation safety:**

- When `source.limit` is **not set**, a default cap of 1000 records applies. If the matching set exceeds this cap, the request is **rejected with HTTP 400** to prevent silent partial mutation — narrow the filter or set `source.limit` explicitly.
- When `source.limit` **is set**, the action applies to the first `limit` records. If truncated, the response includes `truncated: true, appliedLimit: <limit>`.

**Safe to loop on `truncated: true`:** Only when the mutation causes matched records to no longer satisfy the filter (e.g., `delete`, or `patch` that changes a filtered field). Looping on `increment` or unrelated `patch` re-processes the same records indefinitely.

**Response:** `{ matched: 500, affected: 498, failed: 2 }`

Pass `?dryRun=true` to preview matched records without applying the action.

## Using Databases in App Code

The client library is used at runtime to create database instances, execute operations, and manage data.

### Creating database instances

```typescript
const db = await client.databases.create({
  title: "Alpha Project",
  databaseType: "project", // must match a configured database type
});
// db: { databaseId, title, databaseType, metadata, permission, createdBy, createdAt, modifiedAt }
```

### Listing and fetching databases

```typescript
// Lists DBs where the user has a direct permission (owner or manager).
// Databases the user can access ONLY via CEL-gated operations are NOT
// returned, and databases reachable via DatabaseGroupPermission are
// also NOT returned by list() (use groups.listDatabases for those).
// App admins see all DBs in the app.
const databases = await client.databases.list();

// Filter to one databaseType (post-join JS filter — narrows the
// set above, doesn't widen it).
const projects = await client.databases.list({ databaseType: "project" });

// Get a specific database
const db = await client.databases.get(databaseId);

// Update title
await client.databases.update(databaseId, { title: "New Title" });

// Delete (owner only — permanently removes all records and permissions)
await client.databases.delete(databaseId);
```

### Executing operations

```typescript
// Execute a registered operation
const result = await client.databases.executeOperation(databaseId, "listTasks", {
  params: { projectId: "proj-1" },
  limit: 10,
  cursor: previousCursor,
  direction: 1, // 1 for forward, -1 for backward
});
```

**Response shapes by operation type:**

| Operation Type | Response Shape |
|----------------|---------------|
| `query` | `{ data: [...records], hasMore: boolean, nextCursor?: string }` |
| `mutation` | `{ results: [{ success: boolean, id: string }] }` (entire request returns 409 if any sub-op fails) |
| `count` | `{ count: number }` |
| `aggregate` | `{ result: { [groupValue]: { ...computedFields } } }` |
| `pipeline` | When `return = "all"`: `{ steps: { [stepName]: { type, data \| count \| result } } }`. When `return = "<step>"`: that step's payload at top level |
| `applyToQuery` | `{ matched, affected, failed, truncated?, appliedLimit?, warning? }` (or `{matched, affected: 0, failed: 0, dryRun: true, sample: [...]}` when called with `?dryRun=true`) |

**Operation timing:** Pass `timing: true` to get per-phase millisecond timings in `result._timing`. Works on all operation types.

```typescript
const result = await client.databases.executeOperation(databaseId, "listTasks", {
  params: { projectId: "proj-1" },
  timing: true,
});
// result._timing: { totalMs, databaseLookup, operationLookup, celEvaluation, doInvocation, ... }
```

### Bulk operation calls (`executeBatch`)

`executeBatch` invokes a single registered **mutation** operation many times in one HTTP request (up to 100,000 items). Each item is a `{ params }` object — the operation runs once per item, with its `op.access` and per-parameter `access` rules **re-evaluated against each item's params**.

```typescript
const result = await client.databases.executeBatch(databaseId, "createTask", [
  { params: { title: "Task 1", projectId: "proj-1" } },
  { params: { title: "Task 2", projectId: "proj-1" } },
]);
// { imported: 2, failed: 0 }
```

**Constraints:**

- Only `type = "mutation"` operations are accepted (400 otherwise).
- All items in the batch must satisfy the operation's `access` and per-param `access` rules. If **any** item fails authorization, the **whole batch is rejected with 403** before any writes happen.
- Param schema validation is also per-item; the first invalid item rejects the batch with 400.
- Save/patch/delete ops from successfully-resolved items are funneled through one DO `/batch` call (transactional at the DO layer); increment / addToSet / removeFromSet ops are dispatched in parallel afterwards.
- Response is `{ imported, failed }` — `failed` counts items whose individual write succeeded at the auth/validation stage but was rejected by the DO (e.g., `ifNotExists` conflict).

**Don't:** there is no per-item `itemAccess` field on registered operations. To restrict what params a caller can pass per item, put the rule on the operation's `access` (referencing `params.*`) or on individual `params.<name>.access` (referencing `value`) — both are re-evaluated for every batch item.

### Managing database CEL context

The CEL context (formerly called "metadata") stores per-database values that operations and triggers can reference via `$database.celContext.*` (or the legacy alias `$database.metadata.*`):

```typescript
await client.databases.updateCelContext(databaseId, { teamId: "team-alpha", projectId: "proj-1" });
// Legacy alias also works:
await client.databases.updateMetadata(databaseId, { teamId: "team-alpha", projectId: "proj-1" });
```

Via CLI (new preferred form):

```bash
primitive databases cel-context update <database-id> --data '{"teamId":"team-alpha"}'
primitive databases cel-context get <database-id>
# Legacy alias still works:
primitive databases metadata update <database-id> --data '{"teamId":"team-alpha"}'
```

## Direct Record Operations

Direct record operations require owner or manager permission. For most apps, use registered operations instead.

Connect to a database to get a `DoDb` handle:

```typescript
const db = client.databases.connect(databaseId);
```

The handle supports string-based or model-class-based access:

```typescript
// String-based
await db.save("tasks", { id: "task-1", title: "Ship v1" });

// Model-class-based (with js-bao models)
import { Task } from "./models";
await db.save(Task, { id: "task-1", title: "Ship v1" });
```

### Save (upsert)

```typescript
await db.save("products", { id: "prod-1", name: "Widget", price: 9.99 });

// Insert only — fails if record exists
await db.save("products", data, { ifNotExists: true });

// Conditional write
await db.save("products", data, { condition: { status: "draft" } });

// With StringSet fields
await db.save("products", data, { stringSets: { tags: ["featured", "sale"] } });
```

### Patch (partial update)

```typescript
await db.patch("products", "prod-1", { price: 7.99 });

// Conditional patch
await db.patch("products", "prod-1", { price: 7.99 }, { condition: { status: "draft" } });
```

### Find

```typescript
const product = await db.find("products", "prod-1"); // or null
```

### Delete

```typescript
const deleted = await db.delete("products", "prod-1"); // true if existed
```

### Count

```typescript
const total = await db.count("products");
const saleCount = await db.count("products", { onSale: true });
```

### Query

```typescript
const result = await db.query("tasks", filter, options);
// result: { data: T[], hasMore: boolean, nextCursor?: string, prevCursor?: string }
```

### Filter operators

| Operator | Description | Example |
|----------|-------------|---------|
| *(exact match)* | Equals a value (shorthand for `$eq`) | `{ status: "active" }` |
| `$eq` | Explicit equality | `{ status: { $eq: "active" } }` |
| `$ne` | Not equal | `{ status: { $ne: "archived" } }` |
| `$gt` | Greater than | `{ price: { $gt: 10 } }` |
| `$gte` | Greater than or equal | `{ price: { $gte: 10 } }` |
| `$lt` | Less than | `{ price: { $lt: 50 } }` |
| `$lte` | Less than or equal | `{ price: { $lte: 50 } }` |
| `$in` | Matches any value in array | `{ category: { $in: ["books", "music"] } }` |
| `$nin` | Matches none of the values in array | `{ status: { $nin: ["archived", "deleted"] } }` |
| `$startsWith` | String prefix match | `{ name: { $startsWith: "Pro" } }` |
| `$endsWith` | String suffix match | `{ filename: { $endsWith: ".pdf" } }` |
| `$containsText` | Full-text search | `{ name: { $containsText: "deluxe" } }` |
| `$exists` | Field exists (true) or is null/missing (false) | `{ avatar: { $exists: true } }` |
| `$contains` | StringSet contains a value | `{ tags: { $contains: "featured" } }` |
| `$all` | StringSet contains all values | `{ tags: { $all: ["featured", "sale"] } }` |
| `$size` | StringSet element count (number or comparison) | `{ tags: { $size: 3 } }` or `{ tags: { $size: { $gte: 1 } } }` |
| `$or` | Matches any of the conditions | `{ $or: [{ status: "active" }, { priority: { $gte: 5 } }] }` |
| `$and` | Matches all conditions (useful when multiple conditions target the same field) | `{ $and: [{ price: { $gte: 10 } }, { price: { $lte: 50 } }] }` |

`$startsWith`, `$endsWith`, and `$containsText` are mutually exclusive on the same field — only one substring operator per field per query.

Multiple filters on different fields are implicitly combined with AND:

```typescript
// These two are equivalent:
{ status: "active", priority: { $gte: 5 } }
{ $and: [{ status: "active" }, { priority: { $gte: 5 } }] }

// Use explicit $and when you need multiple conditions on the same field:
{ $and: [{ price: { $gte: 10 } }, { price: { $lte: 50 } }] }

// Combine $or with other filters:
{ category: "electronics", $or: [{ onSale: true }, { price: { $lt: 20 } }] }
```

### Boolean gate conditions

Substitution variables (`$database.metadata.*`, `$params.*`, `$steps.*`) can appear **directly as elements** in `$and`/`$or` arrays (not as key-value pairs). The resolved boolean value gates that branch:

| Value | In `$and` | In `$or` |
|-------|-----------|----------|
| `true` | No-op — remaining conditions apply | Short-circuits to match-all |
| `false` / `null` / missing | Short-circuits to no-match (empty result, no DB hit) | Removed — other branches still apply |

**Common use case — per-database feature flag:**

```json
{
  "filter": {
    "$or": [
      { "authorId": "$user.userId" },
      { "$and": ["$database.metadata.peerVisibility", { "status": "approved" }] }
    ]
  }
}
```

When `$database.metadata.peerVisibility` is `true`, the `$and` branch includes approved posts. When it's `false` or missing, the branch short-circuits to no-match — users only see their own records. A missing key evaluates to `null`, so the gate is safely closed before the flag is set.

This also works with `$steps.*` references in pipelines (see [Settings record pattern](#settings-record-pattern)).

### Sort, limit, pagination

```typescript
const page1 = await db.query("tasks", {}, {
  sort: { createdAt: -1 },
  limit: 20,
});

if (page1.hasMore) {
  const page2 = await db.query("tasks", {}, {
    sort: { createdAt: -1 },
    limit: 20,
    uniqueStartKey: page1.nextCursor,
  });
}
```

### Projection

```typescript
const result = await db.query("tasks", {}, {
  projection: { title: 1, status: 1 },
});
```

### Includes (related data)

```typescript
const result = await db.query("orders", {}, {
  include: [{
    model: "customers",
    type: "refersTo",
    sourceField: "customerId",
    as: "customer",
  }],
});
// result.data[0]._related.customer = { id, name, ... }
```

Include types: `refersTo` (FK to one record), `hasMany` (target FK to this record), `refersToMany` (StringSet to multiple records).

## Atomic Operations

### Increment

```typescript
const newValues = await db.increment("products", "prod-1", {
  viewCount: 1,
  stock: -1,
});
// { viewCount: 43, stock: 11 }
```

### StringSet add/remove

```typescript
await db.addToSet("products", "prod-1", { tags: ["featured"] });
await db.removeFromSet("products", "prod-1", { tags: ["sale"] });
```

## Batch Writes (direct)

`db.batch` executes multiple writes atomically at the DO layer. Returns one `BatchOperationResult` per input op (`{success, id, error?, values?}` — `values` for increment ops); a per-item failure does NOT throw, so check `.success` on each result.

```typescript
const results = await db.batch([
  { op: "save",      modelName: "tasks", id: "t-1", data: { title: "A" } },
  { op: "patch",     modelName: "tasks", id: "t-2", data: { done: true } },
  { op: "delete",    modelName: "tasks", id: "t-3" },
  { op: "increment", modelName: "tasks", id: "t-4", fields: { priority: 1 } },
  { op: "addToSet",  modelName: "tasks", id: "t-5", stringSets: { tags: ["urgent"] } },
]);

for (const r of results) {
  if (!r.success) console.warn("op failed:", r.id, r.error);
}
```

### Aggregation (direct)

```typescript
const result = await db.aggregate("orders", {
  groupBy: ["status"],
  operations: [
    { type: "count" },
    { type: "sum", field: "total" },
    { type: "avg", field: "total" },
    { type: "min", field: "total" },
    { type: "max", field: "total" },
  ],
  filter: { createdAt: { $gte: "2025-01-01" } },
  sort: { field: "count", direction: -1 },
  limit: 10,
});
```

## Defining Models

Databases are schemaless — you can save any JSON records without defining models. However, model files provide type safety and automatic index syncing.

If your app also uses documents, you can share the same `BaseModel` classes with both documents and databases. See the [Documents guide](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md#defining-models) for the full model definition workflow with `BaseModel` and codegen.

For database-only apps, use `createModelClass` from the client library:

```typescript
import { defineModelSchema, createModelClass, InferAttrs, TypedModelConstructor } from "js-bao-wss-client";
import type { BaseModel } from "js-bao";

const taskSchema = defineModelSchema({
  name: "tasks",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string", indexed: true },
    status: { type: "string", indexed: true },
    priority: { type: "number", indexed: true },
    assignee: { type: "string" },
  },
});

type TaskAttrs = InferAttrs<typeof taskSchema>;
interface Task extends TaskAttrs, BaseModel {}

const Task: TypedModelConstructor<Task> = createModelClass({ schema: taskSchema });

export { Task };
```

Database field types: `id` (primary key, use `autoAssign: true` for ULIDs), `string`, `number`, `boolean`, `date`, `stringset` (set-of-strings field — use with `addToSet`/`removeFromSet`).

### Indexes

Add `indexed: true` to fields you filter or sort on. Sync indexes after connecting:

```typescript
const db = client.databases.connect(databaseId);
await db.syncIndexes(Task);
```

Or register indexes manually:

```typescript
await db.registerIndex("tasks", "status", "string");
await db.registerIndex("tasks", "priority", "number");

// Unique index
await db.registerIndex("users", "email", "string", true);

// Composite unique constraint
await db.registerUniqueConstraint("tasks", "unique_title_per_project", ["projectId", "title"]);

// List and drop indexes
const indexes = await db.listIndexes("tasks"); // or listIndexes() for all models
await db.dropIndex("tasks", "status");

// List and drop unique constraints
const constraints = await db.listUniqueConstraints("tasks");
await db.dropUniqueConstraint("tasks", "unique_title_per_project");

// Sync indexes for all models passed in the models array at init
await db.syncAllIndexes();
```

## Permissions

### How end users access databases

**Use registered operations with CEL access expressions** to control what end users can do. Do not use `addManager` to give application users access to a database — that grants administrative control over the database itself, not scoped data access.

The correct pattern:
1. Define operations with appropriate `access` CEL expressions (e.g., `isMemberOf('team', database.celContext.teamId)`)
2. Any authenticated user who satisfies the CEL expression can call the operation — no permission grant needed
3. If no operations are registered, non-owner/manager users are denied access entirely

### Owner and manager roles (administrative)

Owner and manager permissions control **who can manage the database itself** — not who can use the app's data. These are administrative roles, not end-user roles.

| Level | Grant/revoke perms | Update title | Update metadata | Delete DB | Bypass CEL gate |
|-------|-------------------|-------------|-----------------|-----------|-----------------|
| `owner` | Yes | Yes | Yes | Yes | Yes |
| `manager` | No (list only) | Yes | Yes | No | Yes |

The database creator is automatically the `owner`. Console admins bypass all checks.

```typescript
// These are for administrative access — not for end-user data access
await client.databases.addManager(databaseId, {
  userId: "co-admin-user-id",
});

// List current permissions
const permissions = await client.databases.listPermissions(databaseId);
// [{ databaseId, userId, permission, grantedAt, grantedBy, userName?, userEmail? }]

// Remove a manager
await client.databases.removeManager(databaseId, "co-admin-user-id");

// Transfer ownership
await client.databases.transferOwnership(databaseId, "new-owner-id");
```

**Don't add end users as managers.** `manager` bypasses every CEL operation gate. The right pattern is: a small fixed set of admin accounts hold owner/manager; everyone else goes through registered operations with `access` rules.

### Group-Based Database Access

`DatabaseGroupPermission` grants the same admin-level access (`manager`) to every member of a group at once. Membership changes propagate automatically. Only `"manager"` is supported.

```typescript
await client.databases.grantGroupPermission(databaseId, {
  groupType: "team",
  groupId: "engineering",
  permission: "manager",
});

const groupPerms = await client.databases.listGroupPermissions(databaseId);
await client.databases.revokeGroupPermission(databaseId, "team", "engineering");

// Group members discover their group-accessible databases via this:
const dbs = await client.groups.listDatabases("team", "engineering");
```

| Call | Resolves group access? |
|------|------------------------|
| `databases.get(id)` | Yes |
| `databases.list()` | **No** — direct grants only |
| `groups.listDatabases(type, id)` | Yes — canonical for group members |

For a unified "all DBs I can access" view, combine `databases.list()` with `groups.listDatabases(...)` for each membership.

**Group permissions are still admin-level access — they don't replace operation-level CEL.** Only the database owner (or an app admin) can grant/revoke group permissions.

## Real-Time Subscriptions

Databases push changes to connected clients over WebSocket. Subscriptions are **per-database** (not per-type) and **created via the REST/admin API, not via the TOML sync flow**. Up to 20 active subscriptions per database; up to 5 declared params per subscription.

### Registering a subscription (admin API)

`POST /app/{appId}/api/databases/{databaseId}/subscriptions` — body shape:

```json
{
  "subscriptionKey": "my-open-tickets",
  "displayName": "My open tickets",
  "description": "Tickets assigned to me",
  "filter": "record.modelName == 'tickets' && record.data.assigneeId == user.userId && record.data.status == 'open'",
  "accessRule": "user.userId != ''",
  "params": { "teamId": { "type": "string", "required": false } }
}
```

**`record` shape inside `filter`:** `record.modelName`, `record.op` (one of `save | patch | delete | increment | addToSet | removeFromSet`), `record.id`, `record.data` (the new/written payload, or `null` for deletes), `record.previousData` (the prior row when subscribers exist; `null` otherwise). Field-level access is via `record.data.<field>` and `record.previousData.<field>` — fields are not spread onto `record` itself.

Field semantics:

- `accessRule` (CEL) — evaluated at subscribe time; false → subscribe is rejected.
- `filter` (CEL) — evaluated per-change, per-subscriber against `record.*`. Only matches are delivered. Cannot grant access `accessRule` denies.
- `params` — declared params bound to the subscriber and exposed as `params.*` inside `filter` and `accessRule`. Supported types: `string`, `number`, `boolean`. Type checks at subscribe time are strict — no coercion (mismatched types are rejected with an error frame).

CEL context differs between the two phases:

- `accessRule` (subscribe time): `user.userId`, `user.role`, `params.*`, plus the standard membership functions (`isMemberOf`, `memberGroups`, `hasRole`).
- `filter` (per-change broadcast): `user.userId` (with `user.role` empty), `record.*` (the changed row, including `record.op`, `record.id`, `record.previousData` when available), and `params.*`. Memberships and `database.*` are **not** bound at filter time, so put group-based authorization in `accessRule`, not `filter`.

### Subscribing from the client

```typescript
const unsub = client.databases.subscribe(databaseId, "my-open-tickets", {
  params: { teamId: "team-1" },
  onChange: (event) => {
    // event.changes: Array of { op, modelName, id, data?, previousData? }
    for (const change of event.changes) {
      // change.op: "save" | "patch" | "delete" | "increment" | "addToSet" | "removeFromSet"
      applyChange(change);
    }
  },
});

// Later:
unsub();
```

`subscribe` is synchronous; the unsubscribe callback returns immediately. The client auto-reissues `db.subscribe` on WebSocket reconnect.

### Critical Rules

1. **Always pair initial load with subscription.** Subscriptions deliver deltas only — fetch initial state with a regular `executeOperation` call and keep the query's filter semantically equivalent to the subscription's `filter`.
2. **Writer's connection is excluded.** The client that triggered the mutation does not receive the change event back.
3. **No replay on reconnect.** Re-query on reconnect; the server does not buffer missed changes.
4. **Each change carries `previousData` only when the database has active subscribers.** If you need to compare old vs new in your filter, you can; the server pre-reads the row before mutating.
5. **Workflow mutations fan out too.** A `database.mutate` step in a workflow wakes up every matching subscription.

See the [Scheduling and Real-Time guide](AGENT_GUIDE_TO_PRIMITIVE_SCHEDULING_AND_REALTIME.md) for the full walkthrough.

## Schema Introspection

Databases are schemaless — the system tracks fields and inferred types as records are written.

```typescript
// List models (collections)
const response = await fetch(
  `${apiUrl}/app/${appId}/api/databases/${databaseId}/records/models`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const { models } = await response.json();
// ["contacts", "orders", "products"]

// Describe a model's fields
const fields = await client.databases.describe(databaseId, "products");
// [{ model_name: "products", field_name: "name", inferred_type: "string", first_seen_at: "..." }]
```

Inferred types: `string`, `number`, `boolean`, `array`, `object`.

## CSV Import

```typescript
import { Product } from "./models";

// With model class
const result = await client.databases.importCsv(databaseId, {
  csv: csvString,
  model: Product,
  columnMap: { "Product Name": "name", "Unit Price": "price" },
});

// Without model class (csv string or pre-parsed data array)
const result = await client.databases.importCsv(databaseId, {
  csv: csvString,       // provide csv or data, not both
  // data: parsedRows,  // alternative: pre-parsed array of objects
  modelName: "products",
  types: { price: "number", stock: "number" },
  idColumn: "sku",
  transform: (row, index) => {
    if (!row.name) return null; // skip
    return { ...row, importedAt: new Date().toISOString() };
  },
  batchSize: 10000,
  onProgress: ({ processed, total, imported, failed }) => {
    console.log(`${processed}/${total} processed`);
  },
});
// result: { imported: number, failed: number, errors: [...], indexesCreated: number, durationMs: number }
```

## Best Practices

### Database design

- **Create multiple databases for isolation.** Each database is a separate Durable Object. Use separate databases for separate tenants, projects, or data domains to leverage per-database scaling.
- **Use database types** to share operation definitions and triggers across databases of the same kind.
- **Keep CEL context minimal — use groups for access control.** The CEL context is meant for a few identifying fields (e.g. a `teamId`) used as lookup keys in CEL — `isMemberOf('team', database.celContext.teamId)`. Group membership controls access; the CEL context just provides the key. Don't replicate data into metadata for field-by-field CEL checks — model that with groups. For runtime-toggleable settings, store them as records and read them in a pipeline (see [Settings record pattern](#settings-record-pattern)).
- **Use triggers** to enforce server-side invariants (created timestamps, audit fields) — don't trust client-provided values.

### Operations design

- **Keep operations focused.** Each operation should serve one purpose with a clear access rule.
- **Use parameterized filters**, not hardcoded values. Let callers pass IDs and filter criteria via `$params.*`.
- **Set restrictive access by default.** Start with specific CEL expressions and widen as needed.
- **Use projections** to limit response payloads — only return fields the client needs.
- **Use pipelines** for dashboard-style views that need data from multiple models in one round-trip. Pipelines are read-only — for "read-then-mutate" flows, use a pipeline to read, then call a separate mutation operation.
- **Default to server-assigned IDs in `save`.** When neither `opDef.id` nor `data.id` is provided, the server generates a ULID and returns it in `results[].id`. You may pass an explicit id via `opDef.id` or `data.id` (they must match if both are set, otherwise the request is rejected) — but only do that when you genuinely need a deterministic id (idempotency, foreign-key linkage to a precomputed key). Never pipe `$params.id` into save data unless that param is itself derived from a trusted source.

### Security

- **`$params.*` is caller-controlled. Never use it for authorization-relevant fields.** Substitution is literal — whatever the caller passes ends up in the resolved JSON.

  ```toml
  # WRONG — caller can claim any role:
  definition = '{"operations":[{"op":"save","data":{"authorRole":"$params.authorRole","title":"$params.title"}}]}'

  # RIGHT — split into per-role operations, hardcode the role server-side, gate each with CEL:
  [[operations]]
  name = "createTeacherPost"
  type = "mutation"
  modelName = "posts"
  access = "isMemberOf('class-teachers', database.metadata.classId)"
  definition = '{"operations":[{"op":"save","data":{"authorRole":"teacher","title":"$params.title","authorId":"$user.userId"}}]}'
  params = '{"title":{"type":"string","required":true}}'
  ```

- **Don't use `addManager` to grant "access to data."** `manager` bypasses every operation-level CEL gate and grants administrative control. End-user data access goes through registered operations with CEL `access`; `manager` is reserved for the small set of accounts that should be able to update title, metadata, and (for `owner`) delete the database.
- **Per-parameter `access` is enforced on both `executeOperation` and `executeBatch`.** A param rule like `"access": "value == user.userId"` is re-evaluated for every batch item — that's the right place to put per-item authorization, NOT a (non-existent) `itemAccess` field.
- **Trigger CEL is fail-closed.** Any error during a `when` or `set` expression silently skips the trigger — so a malformed expression doesn't crash the write but also doesn't run. Test triggers explicitly.

For broader access-control patterns (group-based access, per-parameter access, rule sets), see the [Users and Groups guide](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md).

### Performance

- **Register indexes** on every field used in `filter` or `sort`. Without an index, the DO falls back to scanning all records of that model.
- **Cap with `limit`.** Definition `limit` clamps caller-supplied `limit` to its own value (effective limit = `min(definition.limit, callerLimit)`).
- **`count` ops are much cheaper than `query` for "how many".**
- **Use `executeBatch`** for client-side bulk writes (up to 100,000 items per call); use `applyToQuery` to mutate every record matching a server-side filter without shipping the IDs across the wire.

## Common Patterns

For team-based and group-based access patterns, see the [Users and Groups guide](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md). For architecture-level patterns (when to use databases vs. documents), see the [Data Modeling guide](AGENT_GUIDE_TO_PRIMITIVE_DATA_MODELING.md).

### Settings record pattern

For mutable application settings (feature flags, visibility toggles, etc.), store them as a regular database record rather than in `database.metadata`. Use a pipeline to read the settings record and incorporate its values into subsequent query filters via `$steps.*`:

**In `config/database-types/classroom.toml`:**

```toml
[[operations]]
name = "listVisiblePosts"
type = "pipeline"
modelName = "_pipeline"
access = "isMemberOf('class-students', database.id)"
definition = '{"steps":[{"name":"settings","type":"query","modelName":"settings","filter":{"key":"class-settings"},"limit":1},{"name":"posts","type":"query","modelName":"posts","filter":{"$or":[{"authorId":"$user.userId"},{"$and":["$steps.settings.first.peerVisible",{"status":"approved"}]}]},"sort":{"createdAt":-1},"limit":50}],"return":"posts"}'
params = '{}'
```

This pipeline first reads the settings record, then uses `$steps.settings.first.peerVisible` as a **boolean gate** in the posts query. When `peerVisible` is `true`, the `$and` branch opens and includes approved posts from all students. When the settings record doesn't have `peerVisible` set (or it's `false`), the gate short-circuits to no-match, so students only see their own posts. See [Boolean gate conditions](#boolean-gate-conditions) for details on this pattern.

### User-scoped data via operations

Operations that scope data to the calling user using `$user.userId`:

**In `config/database-types/app_data.toml`:**

```toml
[[operations]]
name = "myItems"
type = "query"
modelName = "items"
access = "true"
definition = '{"filter":{"ownerId":"$user.userId"},"sort":{"createdAt":-1},"limit":50}'

[[operations]]
name = "createItem"
type = "mutation"
modelName = "items"
access = "true"
definition = '{"operations":[{"op":"save","data":{"title":"$params.title","ownerId":"$user.userId","createdAt":"$now"}}]}'
params = '{"title":{"type":"string","required":true}}'
```

**In app code:**

```typescript
// Each user only sees their own items
const result = await client.databases.executeOperation(dbId, "myItems", {});

// Creates an item owned by the calling user (server sets ownerId and assigns ID)
const createResult = await client.databases.executeOperation(dbId, "createItem", {
  params: { title: "My Item" },
});
const itemId = createResult.results[0].id; // server-assigned ULID
```

## Reserved Field Names

Any field starting with `_` (underscore) is reserved for internal use. The internal columns `_id`, `_type`, and `_data` are used by the storage engine. The `id` field is the record's primary key.

## Common Errors

| Symptom | Cause | Fix |
|---------|-------|-----|
| 403 on operation execute | CEL `access` expression returned false | Check user's groups/roles match the access expression |
| 403 on direct record access | User is not owner/manager | Use registered operations for non-privileged users |
| Using `addManager` for end-user access | Granting manager/owner gives administrative control, not scoped data access | Define registered operations with CEL access expressions instead |
| 400 on operation registration | Invalid CEL expression or missing required fields | Validate CEL syntax; ensure `name`, `type`, `modelName`, `access`, `definition` are provided |
| Empty results from query | Missing index on filtered field | Register indexes on fields used in filters |
| `$params.x` not substituted (filter key dropped, save field missing) | Parameter not declared in `params` schema | Add `x` to the operation's `params` schema; otherwise `$params.x` resolves to `undefined` and the surrounding key is silently dropped |
| 400 "ID conflict in save operation" | Both `opDef.id` and `data.id` were provided and differ | Set the id in one place only |
| 400 "applyToQuery matched more than 1000 records" | Default cap hit because `source.limit` was not set | Narrow `source.filter`, or set `source.limit` explicitly to opt into truncation |
| 409 from a mutation operation | One or more sub-ops in the batch failed (e.g., `ifNotExists` conflict) | Inspect the error message; mutation operations bundle all sub-ops into one DO `/batch` call and surface the first failure |
| `executeBatch` rejected with 400 "executeBatch only supports mutation operations" | Operation type is not `mutation` | Only `type = "mutation"` operations work with `executeBatch` |
| Records not found after save | Querying wrong `modelName` | Model names are case-sensitive collection identifiers |
