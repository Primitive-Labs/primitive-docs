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
metadataAccess = "isMemberOf('team', database.metadata.teamId)"

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
primitive sync init --dir ./config    # Initialize config directory
primitive sync pull --dir ./config    # Pull current config from server
primitive sync diff --dir ./config    # Preview changes
primitive sync push --dir ./config    # Push local config to server
primitive sync push --dir ./config --dry-run  # See what would change without applying
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
metadataAccess = "isMemberOf('team', database.metadata.teamId)"  # optional — CEL for metadata updates

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

### CLI commands for database management

Beyond sync, the CLI provides direct commands for managing databases:

```bash
# Database types
primitive database-types list
primitive database-types get project
primitive database-types create project --triggers '...'
primitive database-types operations list project
primitive database-types operations get project listTasks

# Database instances
primitive databases list
primitive databases create "My DB" --type project
primitive databases create "My DB" --type project --metadata '{"teamId":"team-1"}'
primitive databases get <database-id>
primitive databases delete <database-id>

# Database operations
primitive databases operations list <database-id>
primitive databases metadata update <database-id> --metadata '{"teamId":"team-1"}'

# Record introspection and querying (admin only)
primitive databases records models <database-id>
primitive databases records describe <database-id> <model-name>
primitive databases records query <database-id> <model-name> --filter '{"status":"open"}'
primitive databases records query <database-id> <model-name> --filter-file ./filter.json
primitive databases records query <database-id> <model-name> --filter-file ./filter.toml

# Export / Import (data migration)
primitive databases export <database-id> --output ./primitive-export    # Export records, indexes, constraints
primitive databases import <path> --overwrite --dry-run                 # Import from export directory
```

Export creates a directory under `<output>/databases/<database-id>/` containing `metadata.json`, `records.jsonl`, `indexes.json`, and `constraints.json`. Import restores records and indexes into a new or existing database. Database type config (operations, triggers, access rules) is not included in the export — run `primitive sync push` on the target app before importing to ensure the type config exists.

## Database Types

A **database type** is a named configuration shared across many databases. It provides:

- **Registered operations** — queries, mutations, counts, aggregates, pipelines, batch writes, and apply-to-query with per-operation CEL access control
- **Triggers** — computed fields that run server-side before save
- **Subscriptions** — named WebSocket subscriptions with CEL access rules and per-change filter rules
- **Metadata access rules** — CEL expression controlling who can update database metadata
- **Rule set attachment** — for managing who can edit the type config and operations

### Triggers

Triggers are computed fields that run automatically before a record is saved. They are configured per model in the `[triggers]` section of the database type TOML file.

**Trigger fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `on` | string | Yes | When to fire: `"create"`, `"update"`, or `"save"` (both) |
| `when` | string | No | CEL condition — trigger only fires if this evaluates to true |
| `set` | object | Yes | Map of field name to CEL expression value |

**Trigger CEL context:**

| Variable | Description |
|----------|-------------|
| `user.userId` | The user performing the save |
| `user.role` | The user's app role |
| `record.*` | The record being saved (current field values) |
| `database.id` | The database ID |
| `database.metadata` | The database's metadata object |
| `now()` | Current ISO 8601 timestamp |
| `lookup(modelName, id)` | Load another record for cross-references |

## Registered Operations

Registered operations are named, parameterized database operations defined at the database-type level. They are the primary data access layer — all user interaction with database data goes through operations.

### Access control model

- **All end-user data access** goes through registered operations, controlled by each operation's `access` CEL expression
- **Owner/manager** are administrative roles for managing the database itself — not for granting end-user access (see [Permissions](#permissions))
- If no operations are registered, non-owner/manager users are denied access entirely

### CEL access expressions

Each operation has an `access` field — a CEL expression evaluated at call time:

```
"true"                                           // all authenticated users
"hasRole('admin')"                               // app admins only
"isMemberOf('team', database.metadata.teamId)"   // team members
"user.userId == params.userId"                   // only your own data
```

**CEL context variables:** `user.userId`, `user.role`, `database.id`, `database.metadata`, `params.*`

Only `database.id` and `database.metadata` are available in CEL — other database fields like `createdBy` are not exposed. To check ownership, store the creator's ID in metadata at creation time or use group membership.

**CEL functions:** `isMemberOf(groupType, groupId)`, `memberGroups(groupType)`, `hasRole(role)`

For group-based access patterns, per-parameter access, and detailed CEL examples, see the [Users and Groups guide](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md).

### Parameters

Declare parameters that callers must provide. In TOML config files, `params` is a JSON string:

```toml
params = '{"projectId":{"type":"string","required":true},"status":{"type":"string"}}'
```

Parameter types: `"string"`, `"number"`, `"boolean"`, `"object"`.

**Per-parameter access control:** Add an `access` CEL expression to a parameter to restrict what values a caller can pass. The caller's value is available as `value`:

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

Use these in operation definitions (filters, data, IDs):

| Variable | Resolves to |
|----------|-------------|
| `$user.userId` | Current user's ID |
| `$now` | Current ISO 8601 timestamp |
| `$database.id` | The database instance ID |
| `$database.metadata.key` | Value from database metadata (null if missing) |
| `$params.fieldName` | Caller-provided parameter |
| `$steps.stepName.*` | Pipeline cross-step references (see Pipelines) |

If a substitution variable (`$params.fieldName`, `$database.metadata.*`, or `$steps.*`) resolves to no value, the key whose value is that variable is **omitted** from the resolved definition — not set to null, undefined, or empty string. Any value the caller actually provides is passed through verbatim, including falsy values (`""`, `0`, `false`, and explicit `null`). The mechanism: substitution replaces the variable with the caller's value or with `undefined` if missing, and the resolved object is JSON-serialized before being forwarded — `JSON.stringify` drops keys whose values are `undefined`, so an unset optional param naturally produces an absent key.

This applies everywhere substitution variables are used:

- **In filters (query, count, aggregate):** The filter key is removed, so the query matches all values for that field.
- **In pipeline step filters:** Same rule — the step's filter key is removed when the referenced value is missing.
- **In mutation data (save/patch):** The field is excluded from the written record entirely. An optional `$params.fieldName` in save data that the caller doesn't provide results in that field not being set on the record — it is not set to null or empty string.

#### Optional filter fields

A parameter declared `"required": false` makes its filter field optional: callers can include it to narrow results, or omit it to ignore that field. When the caller doesn't pass the parameter, the filter key is dropped before the query reaches the database — an unset substitution doesn't become `{field: undefined}` in the dispatched filter, it's removed entirely. Use one operation with an optional filter instead of declaring separate ops per filter combination (e.g., `listPosts` + `listPostsByAuthor`).

```toml
[[operations]]
name = "listPosts"
type = "query"
modelName = "posts"
access = "true"
definition = '{"filter":{"status":"approved","authorId":"$params.authorId"},"sort":{"createdAt":-1},"limit":50}'
params = '{"authorId":{"type":"string","required":false}}'
```

| Caller input | Resolved filter | Behavior |
|---|---|---|
| `{}` | `{"status":"approved"}` | All approved posts |
| `{"authorId":"user-123"}` | `{"status":"approved","authorId":"user-123"}` | Approved posts by that author |
| `{"authorId":""}` | `{"status":"approved","authorId":""}` | Approved posts where `authorId` is the empty string (filter key is kept — only `undefined` drops) |
| `{"authorId":null}` | `{"status":"approved","authorId":null}` | Approved posts where `authorId` is explicitly null |

The same pattern works for pipeline step filters, `$database.metadata.*` references, and `$steps.*` references — in every case, a missing value drops the key and a provided value (including falsy) is used verbatim.

> **Gotcha:** If a filter references `$params.X` but `X` isn't declared in the operation's `params` schema, the key is always dropped and the operation silently becomes a match-all for that field. Double-check that every `$params.*` reference in a filter or data payload has a matching entry in `params`.

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
| `save` | Create or replace a record | `data`, optional `ifNotExists`, `condition`, `stringSets` |
| `patch` | Partial update | `id`, `data` |
| `delete` | Remove a record | `id` |
| `increment` | Atomic numeric increment/decrement | `id`, `fields` |
| `addToSet` | Add values to StringSet fields | `id`, `stringSets` |
| `removeFromSet` | Remove values from StringSet fields | `id`, `stringSets` |

**Response:** `{ results: [{ success: true, id: "..." }] }`

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

**Pipeline step references:**

| Variable | Description |
|----------|-------------|
| `$steps.stepName.first` | First record from a query step |
| `$steps.stepName.first.field` | A field from the first record |
| `$steps.stepName.all.field` | Array of a field from all records |
| `$steps.stepName.count` | Record count from a query or count step |
| `$steps.stepName.results` | Full results (query: array, count: number, aggregate: object) |
| `$steps.stepName.result` | Aggregate result object |

**Response:** `{ steps: { recentTasks: { type: "query", data: [...] }, statusBreakdown: { type: "aggregate", result: {...} }, openBugs: { type: "count", count: 2 } } }`

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
// List databases the current user can access — includes databases
// where the user has a direct permission (owner or manager) OR a
// matching DatabaseGroupPermission via their group memberships.
// App admins see every database. Databases accessible only via
// CEL-gated registered operations are not included.
const databases = await client.databases.list();

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
| `mutation` | `{ results: [{ success: boolean, id: string }] }` |
| `count` | `{ count: number }` |
| `aggregate` | `{ result: { [groupValue]: { ...computedFields } } }` |
| `pipeline` | `{ steps: { [stepName]: { type, ...stepResult } } }` — each step's result matches its operation type (query steps have `data`, count steps have `count`, aggregate steps have `result`) |

**Operation timing:** Pass `timing: true` to get per-phase millisecond timings in `result._timing`. Works on all operation types.

```typescript
const result = await client.databases.executeOperation(databaseId, "listTasks", {
  params: { projectId: "proj-1" },
  timing: true,
});
// result._timing: { totalMs, databaseLookup, operationLookup, celEvaluation, doInvocation, ... }
```

### Bulk operations

Execute any operation across many items in one call (up to 100,000). Useful for bulk inserts, deletes, updates, or any other mutation:

```typescript
const result = await client.databases.executeBatch(databaseId, "createTask", [
  { params: { title: "Task 1", projectId: "proj-1" } },
  { params: { title: "Task 2", projectId: "proj-1" } },
]);
// { imported: 2, failed: 0 }
```

### Managing database metadata

Store per-database context (team ID, project ID) that operations can reference via `$database.metadata.*`:

```typescript
await client.databases.updateMetadata(databaseId, { teamId: "team-alpha", projectId: "proj-1" });
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
| *(exact match)* | Equals a value | `{ status: "active" }` |
| `$ne` | Not equal | `{ status: { $ne: "archived" } }` |
| `$gt` | Greater than | `{ price: { $gt: 10 } }` |
| `$gte` | Greater than or equal | `{ price: { $gte: 10 } }` |
| `$lt` | Less than | `{ price: { $lt: 50 } }` |
| `$lte` | Less than or equal | `{ price: { $lte: 50 } }` |
| `$in` | Matches any value in array | `{ category: { $in: ["books", "music"] } }` |
| `$startsWith` | String prefix match | `{ name: { $startsWith: "Pro" } }` |
| `$containsText` | Full-text search | `{ name: { $containsText: "deluxe" } }` |
| `$exists` | Field exists (true) or is null/missing (false) | `{ avatar: { $exists: true } }` |
| `$contains` | StringSet contains a value | `{ tags: { $contains: "featured" } }` |
| `$all` | StringSet contains all values | `{ tags: { $all: ["featured", "sale"] } }` |
| `$or` | Matches any of the conditions | `{ $or: [{ status: "active" }, { priority: { $gte: 5 } }] }` |
| `$and` | Matches all conditions (useful when multiple conditions target the same field) | `{ $and: [{ price: { $gte: 10 } }, { price: { $lte: 50 } }] }` |

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

## Batch Writes

Execute multiple operations in a single request:

```typescript
const results = await db.batch([
  { op: "save", modelName: "tasks", id: "t-1", data: { title: "A" } },
  { op: "patch", modelName: "tasks", id: "t-2", data: { done: true } },
  { op: "delete", modelName: "tasks", id: "t-3" },
  { op: "increment", modelName: "tasks", id: "t-4", fields: { priority: 1 } },
]);
```

### Registered `executeBatch` Operations

For end-user batch writes through a registered operation, use `type = "executeBatch"` with a per-item CEL rule. Each item in the batch is authorized independently, so a single failing item does not fail the whole batch.

```toml
[[operations]]
name = "import-contacts"
type = "executeBatch"
modelName = "contact"
access = "hasRole('admin')"
itemAccess = "params.createdBy == user.userId"
```

```typescript
await client.databases.executeOperation(databaseId, "import-contacts", {
  items: [
    { op: "save",  data: { name: "Alice", createdBy: userId } },
    { op: "patch", id: "rec-1", data: { status: "verified" } },
    { op: "delete", id: "rec-2" },
  ],
});
// Response: { results: [{ ok: true, id }, { ok: false, error: "..." }, ...] }
```

**Use `executeBatch` when** the caller needs to apply many individual writes it constructed on the client, each of which should be authorized separately.

## Apply-to-Query

For "update every record that matches this filter," use `applyToQuery` — a single server-side operation that runs a query and applies a mutation to each matching record.

```toml
[[operations]]
name = "mark-overdue"
type = "applyToQuery"
modelName = "task"
access = "hasRole('admin')"
query = '{"filter":{"dueDate":{"$lt":"$params.now"},"status":"pending"}}'
mutation = '{"op":"patch","data":{"status":"overdue"}}'
params = '{"now":{"type":"string","required":true}}'
```

```typescript
const result = await client.databases.executeOperation(databaseId, "mark-overdue", {
  params: { now: new Date().toISOString() },
});
// { matched: 142, updated: 142, truncated: false }
```

**Truncation.** If the query matches more records than the per-call cap, `truncated: true` is returned — loop until `truncated: false`:

```typescript
while (true) {
  const r = await client.databases.executeOperation(databaseId, "mark-overdue", {
    params: { now },
  });
  if (!r.truncated) break;
}
```

**Use `applyToQuery` instead of `executeBatch` when** you don't want to ship the record list across the wire — the server already knows which records match.

## Aggregation

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

Database field types: `id` (primary key, use `autoAssign: true` for ULIDs), `string`, `number`.

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
1. Define operations with appropriate `access` CEL expressions (e.g., `isMemberOf('team', database.metadata.teamId)`)
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

**Anti-pattern: Adding end users as managers.** It is almost never correct to add individual end users as managers of a database. The `manager` role bypasses CEL access gates entirely and grants administrative control over the database — it is not a way to give users access to data. The proper pattern is that only a small number of privileged accounts (the creator, perhaps one or two co-admins) have direct owner/manager access to a database, and **all other user access goes through registered operations** with CEL access expressions. If you find yourself writing a loop that grants `manager` to each user who needs to interact with a database, stop — define operations with appropriate `access` rules instead.

### Group-Based Database Access

Use `DatabaseGroupPermission` to grant database access to every member of a group in one step. Members gain the specified permission level (currently `manager` only); membership changes propagate automatically.

```typescript
// Grant manager access to every member of the "team:engineering" group
await client.databases.grantGroupPermission(databaseId, {
  groupType: "team",
  groupId: "engineering",
  permission: "manager", // only valid value for group permissions
});

// List all group permissions on a database
const groupPerms = await client.databases.listGroupPermissions(databaseId);

// Revoke a group permission
await client.databases.revokeGroupPermission(databaseId, "team", "engineering");

// List all databases accessible to a group (callable by group members or app admins)
const dbs = await client.groups.listDatabases("team", "engineering");
```

Resolution semantics:

| Call | Resolves group access? |
|------|------------------------|
| `databases.get(databaseId)` | Yes — group members (via any matching `DatabaseGroupPermission`) can load metadata |
| `databases.list()` | **No** — direct grants only (matches `documents.list()` semantics) |
| `groups.listDatabases(groupType, groupId)` | Yes — the canonical way for a group member to discover databases they have group-level access to |

Group-accessible databases do not appear in `databases.list()`. If your app needs a unified "all databases I can access" view, combine `databases.list()` (direct) with `groups.listDatabases(...)` for each of the user's memberships.

**Use groups for management-level access to a database; still use registered-operation CEL for end-user data access.** Do not replace operation-level CEL gates with a group permission — that grants administrative powers, not just data access. Only the database owner (or an app admin) can grant or revoke group permissions.

See the [Users and Groups guide](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md) for group-based access patterns.

## Real-Time Subscriptions

Databases push changes to connected clients over WebSocket. Define subscriptions in the database type config and subscribe from the client.

### Registering

```toml
[[subscriptions]]
name = "my-open-tickets"
modelName = "ticket"
access = "user.userId != ''"
filter = "record.assigneeId == user.userId && record.status == 'open'"

[[subscriptions]]
name = "tickets-by-team"
modelName = "ticket"
access = "isMemberOf('team', params.teamId)"
filter = "record.teamId == params.teamId"
params = '{"teamId":{"type":"string","required":true}}'
```

- `access` is evaluated at subscribe time. A false result rejects the subscribe call.
- `filter` is evaluated per-change, per-subscriber. Only matches are delivered.
- `filter` can only narrow what `access` allows; it cannot grant access the rule denies.

### Subscribing

```typescript
const sub = await client.databases
  .database(databaseId)
  .subscribe("my-open-tickets");

sub.on("change", (event) => {
  // event.op: "save" | "patch" | "delete"
  // event.before / event.after
  applyChange(event);
});

sub.unsubscribe();
```

### Critical Rules

1. **Always pair initial load with subscription.** Subscriptions deliver deltas only; the initial state comes from a regular operation call. Keep the query's filter and the subscription's filter semantically equivalent.

2. **Writer's connection is excluded.** The client that triggered the mutation does not receive the change event.

3. **No replay on reconnect.** Re-query on reconnection; the server does not buffer missed changes.

4. **Workflow mutations fan out too.** A `database.mutate` step in a workflow wakes up every matching client subscription. This is the primary way to build live workflow-progress UIs.

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
- **Keep metadata minimal — use groups for access control.** Metadata has a 1KB limit and is meant for a few identifying fields: the creator's user ID, a related object ID (e.g., a team or project ID), or a category label. Its primary purpose is to connect a database to a group for CEL access checks — e.g., store a `teamId` so operations can use `isMemberOf('team', database.metadata.teamId)`. The group membership is what controls access; metadata just provides the lookup key. Do not replicate data into metadata to check field-by-field in CEL — if you need complex access rules, model them with groups instead. Metadata can be updated, but changing it affects access rule evaluation for all operations on that database, so treat it as mostly-static. For mutable settings that users toggle at runtime, store them as database records and use pipeline queries with `$steps.*` references to incorporate settings into subsequent query filters (see the [settings record pattern](#settings-record-pattern) below).
- **Use triggers** to enforce server-side invariants (created timestamps, audit fields) — don't trust client-provided values.

### Operations design

- **Keep operations focused.** Each operation should serve one purpose with a clear access rule.
- **Use parameterized filters**, not hardcoded values. Let callers pass IDs and filter criteria via `$params.*`.
- **Set restrictive access by default.** Start with specific CEL expressions and widen as needed.
- **Use projections** to limit response payloads — only return fields the client needs.
- **Use pipelines** for dashboard-style views that need data from multiple models in one round-trip. Pipelines are read-only — for "read-then-mutate" flows, use a pipeline to read, then call a separate mutation operation.
- **Anti-pattern: Passing explicit IDs in save operations.** The server ignores any `id` field in save data and always assigns a server-generated ULID. Do not include `"id":"$params.id"` in mutation definitions — it will be silently discarded. Instead, read the server-assigned ID from the mutation response (`results[].id`) and use that for subsequent record linking, references, or client-side state. To find specific records later, query by unique field values or use `limit: 1` queries rather than relying on a predetermined ID.

### Security

- **Treat `$params.*` as untrusted.** Operation parameters come directly from the calling client and can be set to any value. Never use `$params.*` for sensitive fields like roles, permissions, or status values that control authorization.
- **Use server-derived values for sensitive fields.** Hardcode literal values in operation definitions (e.g., `"role": "teacher"`) and gate each operation with a CEL `access` expression. For example, instead of a single `createPost` operation with `"authorRole": "$params.authorRole"`, create separate `createTeacherPost` (with `"authorRole": "teacher"` and `access = "isMemberOf('class-teachers', ...)"`) and `createStudentPost` (with `"authorRole": "student"` and `access = "isMemberOf('class-students', ...)"`) operations. The CEL check ensures only the right users can call each operation, and the role is set server-side.

For access control best practices (group-based access, per-parameter access, rule sets), see the [Users and Groups guide](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md).

### Performance

- **Register indexes** on fields you filter or sort on.
- **Use `limit` in operations** to avoid returning unbounded result sets.
- **Use `count` operations** instead of querying all records just to count them.
- **Use bulk import** for initial data loading or batch migrations.

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
| `$params.x` not substituted | Parameter not declared in `params` | Add the parameter to the operation's `params` schema |
| Passed `id` in save data ignored | Server always assigns a ULID — explicit IDs in save operations are discarded | Remove `id` from save data; read the server-assigned ID from the mutation response (`results[].id`) |
| Records not found after save | Querying wrong `modelName` | Model names are case-sensitive collection identifiers |
