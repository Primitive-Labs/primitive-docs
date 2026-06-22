# Working with Databases in the Primitive platform

Guidelines for building apps with Primitive's server-side database storage.

## Client operations

### Run a registered operation

```swift
  let result = try await client.databases.executeOperation(
    databaseId: databaseId,
    name: "list-products",
    options: ExecuteOperationOptions(params: ["search": "widget"])
  )
  // result: { data: [...records], hasMore, nextCursor? }
```

### List / get databases

```swift
  // Databases where you're owner or manager
  let databases = try await client.databases.list()

  // Any authenticated user can resolve a database by id
  let db = try await client.databases.get(databaseId: databaseId)
```

### Grant a group access

```swift
  _ = try await client.databases.grantGroupPermission(
    databaseId: databaseId,
    params: GrantDatabaseGroupPermissionParams(
      groupType: "team", groupId: "engineering", permission: "manager"
    )
  )
```


## Core Concept: Databases

A **database** is:

1. An isolated, server-side data store (SQLite-backed)
2. Accessed through server-configured **registered operations** with CEL-based access control
3. Schemaless — save any JSON records without upfront schema definition

**Properties:**

- Each database is an isolated instance with its own SQLite storage — strong consistency, zero-config scaling
- All data access goes through **registered operations** with per-operation authorization
- Databases can be organized by **type** — a named configuration shared across many database instances
- Supports queries, mutations, counts, aggregates, multi-step pipelines, atomic operations, batch writes, apply-to-query, and real-time subscriptions

**Size Guidelines:** Individual databases can hold up to ~5GB of data. For larger needs, split data across multiple databases (one per tenant, project, or domain) — each is a separate isolated instance that scales independently.

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
timestamps = { create = "createdAt", update = "modifiedAt" }

[triggers.tasks]
triggers = [
  { on = "create", set = { createdBy = "user.userId" } },
  { on = "save", when = "record.status == 'done' && record.completedAt == null", set = { completedAt = "now()" } },
]

[[operations]]
name = "listTasks"
type = "query"
modelName = "tasks"
access = "isMemberOf('team', database.celContext.teamId)"
definition = '{"filter":{"projectId":"$params.projectId"},"sort":{"createdAt":-1},"limit":50}'
params = '{"projectId":{"type":"string","required":true}}'

[[operations]]
name = "createTask"
type = "mutation"
modelName = "tasks"
access = "isMemberOf('team', database.celContext.teamId)"
definition = '{"operations":[{"op":"save","data":{"title":"$params.title","projectId":"$params.projectId","status":"open","createdBy":"$user.userId"}}]}'
params = '{"title":{"type":"string","required":true},"projectId":{"type":"string","required":true}}'
```

Push configuration to the server:

```bash
primitive sync push --dir ./config
```

### 2. Use databases in app code

Construct the client, then create a database and call its registered operations:


```swift
  // Create a database instance of the configured type
  let db = try await client.databases.create(params: CreateDatabaseParams(
    title: "Alpha Project", databaseType: "project"
  ))

  // Execute registered operations
  let result = try await client.databases.executeOperation(
    databaseId: db.databaseId, name: "listTasks",
    options: ExecuteOperationOptions(params: ["projectId": "proj-1"])
  )

  let createResult = try await client.databases.executeOperation(
    databaseId: db.databaseId, name: "createTask",
    options: ExecuteOperationOptions(params: ["title": "Ship v1", "projectId": "proj-1"])
  )
  // executeOperation returns a JSONValue; mutation result shape is { results: [{ id }] }.
  let taskId = createResult["results"]?.arrayValue?.first?["id"]?.stringValue // server-assigned ULID
```

## Configuring with the CLI

All database configuration — types, operations, triggers, rule sets, group types — is managed through TOML config files and the `primitive sync` command. This keeps configuration version-controlled alongside your code.

```bash
primitive sync init            # Initialize config dir (auto-resolves .primitive/sync/<env>/<appId>/)
primitive sync pull            # Pull current config from server
primitive sync diff            # Preview changes
primitive sync push            # Push local config to server
primitive sync push --dry-run  # See what would change without applying
# Override with a fixed path:
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

```toml novalidate
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
timestamps = { create = "createdAt", update = "modifiedAt" }         # optional — auto-stamp timestamps on every write

[triggers.tasks]
triggers = [
  { on = "create", set = { createdBy = "user.userId" } },
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

# CSV bulk import — load a CSV file into a database via a batch save operation
primitive databases import-csv <database-id> <file.csv> --model <name> \
  [--operation seed_save] [--column-map '{"CSV Header":"field"}'] \
  [--types '{"price":"number"}'] [--id-column <col>] [--batch-size 5000] \
  [--delimiter ,] [--dry-run] [--stop-on-error] [--json]
```


## Database Types

A **database type** is a named configuration shared across many databases. It provides:

- **Registered operations** (`type` is one of `query`, `mutation`, `count`, `aggregate`, `pipeline`, `applyToQuery`) with per-operation CEL `access`
- **Triggers** — computed fields evaluated server-side before each save
- **`celContextAccess`** — CEL expression that lets non-owner/manager users read and update the database's CEL context (defaults to deny when unset; owner/manager always have access)
- **`autoPopulatedFields`** — declarative server-side field stamping on writes (see below)
- **`defaultAccess`** — fallback CEL access rule applied to operations that omit their own `access`
- **`[models.*]` schema** — optional server-enforced model declaration. When present, every op edit (and the schema edit itself) is checked against it; see [Schema gate](#schema-gate)
- **Rule set attachment** — controls who can edit the type config and its operations


### Triggers

Triggers are computed fields that run server-side before a record is saved. Configured per model in the `[triggers.<modelName>]` block of the database type TOML.

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

**Don't confuse trigger CEL with operation substitutions.** Triggers use bare CEL — `user.userId`, `now()`. Operation `definition` and `params` use `$user.userId`, `$now`, `$params.x`, `$database.celContext.x` substitutions, which are deep string-replacement on the JSON template, NOT CEL. (`$database.metadata.x` is accepted as an alternate alias for the same value.)

### Timestamps

The `timestamps` knob on the `[type]` config stamps `createdAt` and/or `modifiedAt` fields automatically on every write, removing the need for per-model trigger boilerplate. Field names are caller-configurable.

```toml
[type]
databaseType = "project"
timestamps = { create = "createdAt", update = "modifiedAt" }
```

| Key | Type | Description |
|-----|------|-------------|
| `create` | string | Field name stamped with the current ISO 8601 timestamp on record creation. Optional. |
| `update` | string | Field name stamped on every save (including the first). Optional. |
| `models` | string[] | Restrict stamping to these models only. Optional — omit to stamp every model under the type. |

Either lifecycle key can be omitted independently: `timestamps = { create = "createdAt" }` stamps only on create. Field names are yours to choose (`createdAt`/`modifiedAt`, `created_at`/`updated_at`, etc.).

```toml
# Only stamp accounts and holdings
timestamps = { create = "createdAt", update = "modifiedAt", models = ["accounts", "holdings"] }
```

If a model has both an explicit `[[triggers]]` block AND `timestamps`, the trigger fires after the auto-stamp (last writer wins). Since the auto-stamp checks "is the field absent" first, an explicit trigger that sets the field always wins on its lifecycle.

Use `timestamps` for the common "every write should have a created/modified stamp" pattern. Use per-model triggers when the rule depends on the record's data (e.g. `completedAt` only when `status == "done"`). Use `autoPopulatedFields` when you need CEL-resolved values beyond `now()` (e.g. `updatedBy = "user.userId"`).

### Auto-populated fields

`autoPopulatedFields` is a declarative alternative to writing the same `createdAt`/`createdBy`/`updatedAt` triggers on every model. Set it on the database type config; the engine stamps the listed fields server-side, applied per op-kind (`create` ⇔ `save` ⇔ `applyToQuery` insert path; `update` ⇔ `patch` ⇔ `applyToQuery` update path).

```toml
[type]
databaseType = "project"

[type.autoPopulatedFields]
ownerId  = "user.userId"                                       # shorthand → on = ["create"]
createdAt = { value = "now()", on = "create" }
updatedAt = { value = "now()", on = ["create", "update"] }
```

Each entry is either:
- A **shorthand** string — the CEL expression to evaluate. Defaults to `on = ["create"]`.
- A **verbose** map `{ value, on }`. `value` is the CEL expression. `on` is `"create"`, `"update"`, or an array of those (the string form is normalized to a single-element array). Other values are rejected.

The `value` CEL shares the same context as the operation's access expression: `user.*`, `database.*`, `params.*`, plus `now()` and the membership functions. Stamps reference `secrets.*` only when needed (the engine refuses to evaluate stamps that read secrets if the operation didn't pre-declare it).

Use auto-populated fields for cross-model invariants (every write should stamp a timestamp); use per-model triggers for invariants that depend on the record's data (e.g. setting `completedAt` only when `status == "done"`).

### `defaultAccess`

Specify a CEL access rule that applies to operations that don't declare their own `access`:

```toml
[type]
databaseType = "project"
defaultAccess = "isMemberOf('team', database.celContext.teamId)"
```

An operation can override the default by setting its own `access`. Without `defaultAccess` (and no per-operation rule), the operation is denied for non-owner/manager callers.

### Schema gate

A database type can carry an optional schema — one or more `[models.<Name>.fields.<field>]` blocks in the same TOML file as the type config. When a schema is present, the server enforces consistency between ops and the schema in both directions:

- **Op-edit gate.** Creating or editing an operation runs every static `modelName` and field reference in `filter` / `projection` / `sort` / `data` / `access` / mutation `condition` against the schema. References that don't resolve fail with HTTP 422 `OPERATION_REFERENCES_UNDEFINED` (the response payload lists each unresolved ref).
- **Schema-edit gate.** Editing or deleting the schema runs every existing op against the proposed new schema. If any op would break, the edit fails with HTTP 422 `SCHEMA_BREAKS_OPERATIONS`. If any op contains references the gate can't statically resolve (see "Dynamic references" below), the edit fails with HTTP 422 `SCHEMA_HAS_UNCHECKABLE_OPS` until you re-run with `primitive sync push --accept-warnings`. Deleting the schema entirely (removing all `[models.*]` blocks from the local file) is rejected with HTTP 409 `OPS_EXIST` while any operations are still registered.

```toml
# config/database-types/inventory.toml
[type]
databaseType = "inventory"

[models.product.fields.id]
type = "id"
auto_assign = true
indexed = true

[models.product.fields.name]
type = "string"

[models.product.fields.priceCents]
type = "number"
indexed = true

[[operations]]
name = "list-products"
type = "query"
modelName = "product"
access = "true"
definition = '{"filter":{"priceCents":{"$gt":0}}}'
```

Adding the `[models.product.fields.*]` blocks above means any future `[[operations]]` that references `product.nameTypo` (instead of `name`) is rejected at push time, before it can return broken data. Note the 422 *message* doesn't name the offending field — the unresolved refs are in the response payload's `refs` array.

**Field types — no object/JSON type.** `[models.*.fields.*]` accepts `string`, `number`, `boolean`, `date`, `id`, `stringset` only. `type = "object"` fails with `TOML_PARSE_ERROR: Invalid field type` — even though operation **params** do accept `"object"`. To store a structured payload (nested objects/arrays), declare the field as `string`, write JSON-encoded values, and parse on the consumer side — e.g. `parse_json(input.payload)` in a workflow `script` step.

**Dynamic references.** Some refs can't be statically checked — for example, `modelName = "$params.kind"` (model determined at call time), a raw `filter` or `projection` lifted from `$params`, `record[expr]` field access, or lambda bodies inside pipelines. These are surfaced as *warnings*, not errors. The op is accepted, but the schema-edit gate later flags them so the operator can review whether the dynamic reference is still consistent with the new schema.

**Bootstrapping an existing type.** If a type already has registered operations and you want to add a schema retroactively, use the scaffolding command:

```bash
primitive databases schema generate <database-type>
```

It calls a server-side endpoint that inspects existing ops + introspects the live database, infers field types where it can, and splices a `[models.*]` block into the local `config/database-types/<type>.toml` file (just before the first `[[operations]]` block). The scaffold is enriched so the output is directly pushable: in addition to sampling live records, it infers field types from how operation params are used, marks fields that operation params require as `required = true`, and emits string enum constraints for fields whose params restrict them to a fixed value set. Review the result — the generator still guesses from observed values, and you may need to fix what it got wrong — then run `primitive sync push` (or `primitive sync push --dry-run` first) to attach it.

**Schemaless types.** A type without any `[models.*]` block is unchanged from the pre-gate behavior — ops are accepted without static consistency checks. Once you add a schema, the consistency invariant holds: the schema-edit gate prevents removing it while ops remain, so future op edits stay aligned with the schema.

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

**CEL functions:** `isMemberOf(groupType, groupId)`, `memberGroups(groupType)`, `hasRole(role)`, `fromWorkflow()`, `fromWorkflow(workflowKey)`

`fromWorkflow()` is true when the call originated from a workflow step (any workflow); `fromWorkflow("key")` restricts to a specific workflow. Use it to lock down ops that should only be invoked by an internal workflow:

```toml
[[operations]]
name = "bulkUpdatePricesFromWorkflow"
access = "fromWorkflow('refresh-security-prices')"
# …
```

This is the cleanest expression of "only the named cron-fired workflow can call this — no user, not even an admin, can call it directly with a hand-crafted request." The workflow identity is only injected when the caller is the internal workflow step runner; external HTTP clients cannot spoof it.

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
| `$database.celContext.key` | Value from database CEL context (`null` if key missing) — `$database.metadata.key` resolves to the same value |
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

**`upsertOn`** — pass the **field name** (`"upsertOn": "email"`, NOT a `$params.*` substitution) in a `save` op to create-or-update by a unique field instead of requiring an explicit `id`. The match **value** comes from `data` — the server looks up a record where that field equals `data.<field>`; if found, it patches it; if not, it inserts a new record. Useful for "ensure this user exists with these attributes" patterns:

```toml
[[operations]]
name = "ensureContact"
type = "mutation"
modelName = "contacts"
access = "hasRole('admin')"
definition = '{"operations":[{"op":"save","upsertOn":"email","data":{"email":"$params.email","name":"$params.name","updatedAt":"$now"}}]}'
params = '{"email":{"type":"string","required":true},"name":{"type":"string","required":true}}'
```

Two failure modes to know:

- `"upsertOn": "$params.email"` gets **value-substituted** like any other definition string, so the server receives the email *value* as the field name and rejects with `upsertOn field 'alice@example.com' must be present in data and not null/empty`.
- `upsertOn` requires a **unique index** on the field — declare `unique = true` on the field in the type schema. Databases created from the type provision the index automatically; a static `upsertOn` naming a field that isn't declared `unique = true` is rejected at push time. For a database created before the field was declared unique, back-provision with `primitive databases reindex <database-id> --from-schema` (idempotent) — without the index, saves fail with `upsertOn field '<field>' does not have a registered unique index`.

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

```swift
  let db = try await client.databases.create(params: CreateDatabaseParams(
    title: "Alpha Project",
    databaseType: "project" // must match a configured database type
  ))
  // db: DatabaseInfo { databaseId, title, databaseType, celContext, permission, createdBy, ... }
```

`db.databaseType` is the configured type; `db.celContext` holds the per-database CEL context dict (`db.metadata` resolves to the same field).

### Listing and fetching databases

`list()` returns DBs where the user has a **direct** permission (owner or manager). Databases reachable only via CEL-gated operations or `DatabaseGroupPermission` are NOT returned by `list()` (use `groups.listDatabases` for group-shared ones). App admins see all DBs in the app. Passing `{ databaseType }` to `list()` is a post-join filter that narrows the set, never widens it.

```swift
  // Databases where the caller is owner or manager (admins see all).
  // Databases reachable only via CEL-gated operations or group grants are
  // NOT returned here — use groups.listDatabases for group-shared ones.
  let databases = try await client.databases.list()

  // Narrow to one databaseType (post-join filter — narrows, never widens).
  let projects = try await client.databases.list(databaseType: "project")

  let db = try await client.databases.get(databaseId: databaseId)

  _ = try await client.databases.update(
    databaseId: databaseId,
    params: UpdateDatabaseParams(title: "New Title")
  )

  // Owner only — permanently removes all records and permissions.
  _ = try await client.databases.delete(databaseId: databaseId)
```

### Executing operations

Callers can override `limit`, `cursor`, and `direction` at call time:

```swift
  let result = try await client.databases.executeOperation(
    databaseId: databaseId,
    name: "listTasks",
    options: ExecuteOperationOptions(
      params: ["projectId": "proj-1"],
      limit: 10,
      cursor: previousCursor,
      direction: .ascending // forward; use .descending to page backward
    )
  )
  // result: { data: [...records], hasMore, nextCursor? }
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

```swift
  let result = try await client.databases.executeOperation(
    databaseId: databaseId,
    name: "listTasks",
    options: ExecuteOperationOptions(params: ["projectId": "proj-1"], timing: true)
  )
  // result._timing: { totalMs, databaseLookup, operationLookup, celEvaluation, ... }
```

### Bulk operation calls (`executeBatch`)

`executeBatch` invokes a single registered **mutation** operation many times in one HTTP request (up to 100,000 items). Each item is a `{ params }` object — the operation runs once per item, with its `op.access` and per-parameter `access` rules **re-evaluated against each item's params**.

```swift
  let result = try await client.databases.executeBatch(
    databaseId: databaseId,
    operationName: "import-contacts",
    batch: [
      DatabaseBatchOperation(params: ["name": "Alice", "email": "alice@example.com"]),
      DatabaseBatchOperation(params: ["name": "Bob", "email": "bob@example.com"]),
    ]
  )
  // result: { imported, failed }
```

**Constraints:**

- Only `type = "mutation"` operations are accepted (400 otherwise).
- All items in the batch must satisfy the operation's `access` and per-param `access` rules. If **any** item fails authorization, the **whole batch is rejected with 403** before any writes happen.
- Param schema validation is also per-item; the first invalid item rejects the batch with 400.
- Save/patch/delete ops from successfully-resolved items are funneled through one `/batch` call (transactional at the storage layer); increment / addToSet / removeFromSet ops are dispatched in parallel afterwards.
- Response is `{ imported, failed }` — `failed` counts items whose individual write succeeded at the auth/validation stage but was rejected by the storage layer (e.g., `ifNotExists` conflict).

**Don't:** there is no per-item `itemAccess` field on registered operations. To restrict what params a caller can pass per item, put the rule on the operation's `access` (referencing `params.*`) or on individual `params.<name>.access` (referencing `value`) — both are re-evaluated for every batch item.

### Managing database CEL context

The CEL context stores per-database values that operations and triggers can reference via `$database.celContext.*` (`$database.metadata.*` resolves to the same values):

```swift
  _ = try await client.databases.updateCelContext(
    databaseId: databaseId,
    celContext: ["teamId": "team-alpha", "projectId": "proj-1"]
  )
```


Via CLI:

```bash
primitive databases cel-context update <database-id> --data '{"teamId":"team-alpha"}'
primitive databases cel-context get <database-id>
```

## Direct Record Operations

Direct record operations require owner or manager permission. For most apps, use registered operations instead.

`connect()` returns a `DoDb` handle. Save (upsert), patch (partial update), find a single record, delete, and count all run against it. A `save` is an upsert; pass `ifNotExists` for insert-only, `condition` for a conditional write, and `stringSets` to seed StringSet fields:

```swift
  let db = client.databases.connect(databaseId: databaseId)

  // Save (upsert) — data must carry an "id" (or use upsertOn).
  _ = try await db.save(modelName: "tasks", data: ["id": "task-1", "title": "Ship v1"])

  // Insert only — fails if the record already exists.
  _ = try await db.save(
    modelName: "tasks", data: ["id": "task-3", "title": "Draft"],
    options: DoDbSaveOptions(ifNotExists: true)
  )

  // Conditional write — only proceeds if the existing record matches.
  _ = try await db.save(
    modelName: "tasks", data: ["id": "task-3", "title": "Draft"],
    options: DoDbSaveOptions(condition: ["completed": false])
  )

  // Seed StringSet fields on the write.
  _ = try await db.save(
    modelName: "tasks", data: ["id": "task-4", "title": "Tagged"],
    options: DoDbSaveOptions(stringSets: ["tags": ["featured", "sale"]])
  )

  // Patch (partial update) — only the provided fields change.
  _ = try await db.patch(modelName: "tasks", id: "task-1", data: ["priority": 5])
  _ = try await db.patch(
    modelName: "tasks", id: "task-1", data: ["priority": 7],
    options: DoDbPatchOptions(condition: ["completed": false])
  )

  // Find a single record by id (or nil).
  let task = try await db.find(modelName: "tasks", id: "task-1")

  // Delete — true if a record existed.
  let deleted = try await db.delete(modelName: "tasks", id: "task-2")

  // Count, optionally filtered.
  let total = try await db.count(modelName: "tasks")
  let open = try await db.count(modelName: "tasks", filter: ["completed": false])
```

### Query

The handle queries with the full filter operator grammar, sort + cursor pagination, projection, and related-data `include`:

```swift
  // Filter operators: exact match, comparisons, set membership, text, $or/$and.
  let result = try await db.query(modelName: "tasks", filter: [
    "completed": false,
    "priority": ["$gte": 5],
    "category": ["$in": ["work", "urgent"]],
    "title": ["$startsWith": "Ship"],
    "tags": ["$contains": "featured"],
    "$or": [["category": "work"], ["priority": ["$gte": 8]]],
  ])

  // Multiple fields on the same object are ANDed; use explicit $and to put
  // two conditions on one field.
  let priced = try await db.query(modelName: "tasks", filter: [
    "$and": [["priority": ["$gte": 1]], ["priority": ["$lte": 5]]],
  ])

  // Sort, limit, and cursor pagination.
  let page1 = try await db.query(
    modelName: "tasks", filter: [:],
    options: DoDbQueryOptions(sort: DoDbSort("priority", .descending), limit: 20)
  )
  var page2: DoDbQueryResult?
  if page1.hasMore {
    page2 = try await db.query(
      modelName: "tasks", filter: [:],
      options: DoDbQueryOptions(sort: DoDbSort("priority", .descending), limit: 20, uniqueStartKey: page1.nextCursor)
    )
  }

  // Projection — return only the named fields.
  let titles = try await db.query(
    modelName: "tasks", filter: [:],
    options: DoDbQueryOptions(projection: DoDbProjection([("title", .include), ("completed", .include)]))
  )

  // Include related records — they land under _related on each parent.
  let withCategory = try await db.query(
    modelName: "tasks", filter: [:],
    options: DoDbQueryOptions(include: [
      DoDbInclude(model: "categories", type: .refersTo, sourceField: "category", alias: "categoryInfo")
    ])
  )
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

Multiple filters on different fields are implicitly combined with AND. Use an explicit `$and` only when you need two conditions on the *same* field (e.g. a range), and combine `$or` with other top-level fields freely.

Include types: `refersTo` (FK to one record), `hasMany` (target FK to this record), `refersToMany` (StringSet to multiple records). The loaded records land under `_related` on each parent (e.g. `result.data[0]._related.customer`).

## Atomic Operations

Increment/decrement numeric fields (returns the post-increment values) and add/remove StringSet members atomically — no read-modify-write round trip:

```swift
  // Increment/decrement numeric fields; returns the post-increment values.
  let newValues = try await db.increment(
    modelName: "tasks", id: "task-1",
    fields: ["priority": 1, "estimatedHours": -2]
  )

  // Atomically add/remove StringSet members.
  try await db.addToSet(modelName: "tasks", id: "task-1", sets: ["tags": ["featured"]])
  try await db.removeFromSet(modelName: "tasks", id: "task-1", sets: ["tags": ["sale"]])
```

## Batch Writes (direct)

`db.batch` executes multiple writes atomically at the storage layer. It returns one `BatchOperationResult` per input op (`{success, id, error?, values?}` — `values` for increment ops); a per-item failure does NOT throw, so check `.success` on each result.

```swift
  let results = try await db.batch([
    DoDbBatchOperation(op: .save, modelName: "tasks", id: "t-1", data: ["title": "A"]),
    DoDbBatchOperation(op: .patch, modelName: "tasks", id: "t-2", data: ["completed": true]),
    DoDbBatchOperation(op: .delete, modelName: "tasks", id: "t-3"),
    DoDbBatchOperation(op: .increment, modelName: "tasks", id: "t-4", fields: ["priority": 1]),
    DoDbBatchOperation(op: .addToSet, modelName: "tasks", id: "t-5", stringSets: ["tags": ["urgent"]]),
  ])

  for r in results where !r.success {
    print("op failed:", r.id, r.error ?? "")
  }
```

### Aggregation (direct)

Group by one or more fields and compute `count`/`sum`/`avg`/`min`/`max`, with an optional filter, sort, and limit:

```swift
  let result = try await db.aggregate(modelName: "tasks", options: DoDbAggregationOptions(
    groupBy: [.field("category")],
    operations: [
      DoDbAggregationOperation(type: .count),
      DoDbAggregationOperation(type: .sum, field: "estimatedHours"),
      DoDbAggregationOperation(type: .avg, field: "estimatedHours"),
      DoDbAggregationOperation(type: .min, field: "priority"),
      DoDbAggregationOperation(type: .max, field: "priority"),
    ],
    filter: ["completed": false],
    limit: 10,
    sort: DoDbAggregationSort(field: "count", direction: .descending)
  ))
```


Database field types: `id` (primary key, use `auto_assign = true` for ULIDs), `string`, `number`, `boolean`, `date`, `stringset` (set-of-strings field — use with `addToSet`/`removeFromSet`). There is no object/JSON field type — store structured payloads as JSON strings and parse on read.

### Indexes

Add an index to every field you filter or sort on; without one the engine scans all records of that model. Register them manually, declare composite unique constraints, list and drop them, or sync a model's declared index state at once:

```swift
  // Sync the desired index state for one or more models (additive — the
  // server registers only what's missing).
  _ = try await db.syncIndexes(models: [
    DoDbModelSyncState(
      modelName: "tasks",
      indexes: [
        DoDbModelSyncState.Index(fieldName: "category"),
        DoDbModelSyncState.Index(fieldName: "priority", fieldType: "number"),
      ]
    )
  ])

  // Or register indexes manually.
  try await db.registerIndex(modelName: "tasks", fieldName: "category", fieldType: "string")
  try await db.registerIndex(modelName: "tasks", fieldName: "priority", fieldType: "number")
  try await db.registerIndex(modelName: "appUsers", fieldName: "email", fieldType: "string", unique: true)

  // Composite unique constraint across multiple fields.
  try await db.registerUniqueConstraint(modelName: "categories", constraintName: "name_parentId", fields: ["name", "parentId"])

  // List and drop.
  let indexes = try await db.listIndexes(modelName: "tasks")
  try await db.dropIndex(modelName: "tasks", fieldName: "category")

  let constraints = try await db.listUniqueConstraints(modelName: "categories")
  try await db.dropUniqueConstraint(modelName: "categories", constraintName: "name_parentId")
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

These calls are for administrative access — not for end-user data access:

```swift
  _ = try await client.databases.addManager(
    databaseId: databaseId,
    params: AddManagerParams(userId: coAdminUserId)
  )

  let permissions = try await client.databases.listPermissions(databaseId: databaseId)
  // [DatabasePermissionEntry { databaseId, userId, permission, grantedAt, grantedBy, userName?, userEmail? }]

  _ = try await client.databases.removeManager(databaseId: databaseId, userId: coAdminUserId)

  _ = try await client.databases.transferOwnership(databaseId: databaseId, newOwnerId: newOwnerId)
```

**Don't add end users as managers.** `manager` bypasses every CEL operation gate. The right pattern is: a small fixed set of admin accounts hold owner/manager; everyone else goes through registered operations with `access` rules.

### Group-Based Database Access

`DatabaseGroupPermission` grants the same admin-level access (`manager`) to every member of a group at once. Membership changes propagate automatically. Only `"manager"` is supported.

```swift
  _ = try await client.databases.grantGroupPermission(
    databaseId: databaseId,
    params: GrantDatabaseGroupPermissionParams(
      groupType: "team", groupId: "engineering", permission: "manager"
    )
  )

  let groupPerms = try await client.databases.listGroupPermissions(databaseId: databaseId)
  _ = try await client.databases.revokeGroupPermission(
    databaseId: databaseId, groupType: "team", groupId: "engineering"
  )

  // Group members discover their group-accessible databases via this
  // (databases.list() does NOT return group-shared databases).
  let dbs = try await client.groups.listDatabases(groupType: "team", groupId: "engineering")
```

| Call | Resolves group access? |
|------|------------------------|
| `databases.get(id)` | Yes |
| `databases.list()` | **No** — direct grants only |
| `groups.listDatabases(type, id)` | Yes — canonical for group members |

For a unified "all DBs I can access" view, combine `databases.list()` with `groups.listDatabases(...)` for each membership.

**Group permissions are still admin-level access — they don't replace operation-level CEL.** Only the database owner (or an app admin) can grant/revoke group permissions.


## Schema Introspection

Databases are schemaless — the system tracks fields and inferred types as records are written.

List the models (collections) in a database via the raw records endpoint `GET /app/<appId>/api/databases/<databaseId>/records/models` (returns `{ models: ["contacts", "orders", "products"] }`):

```swift
  let result = try await client.makeRequest(
    "GET",
    "/databases/\(databaseId)/records/models"
  )
  let models = (result as? [String: Any])?["models"] as? [String]
  // models: ["contacts", "orders", "products"]
```

Describe a model's observed fields:

```swift
  let fields = try await client.databases.describe(databaseId: databaseId, modelName: "products")
  // [["model_name": "products", "field_name": "name", "inferred_type": "string", ...]]
```

Inferred types: `string`, `number`, `boolean`, `array`, `object`.

## CSV Import

For one-off, non-programmatic bulk loads, use the CLI path:

```bash
primitive databases import-csv <database-id> <file.csv> --model products \
  --column-map '{"Product Name":"name","Unit Price":"price"}' \
  --types '{"price":"number"}' --id-column SKU
```

The CLI imports through a registered batch (bulk) save operation — `--operation` defaults to `seed_save`, so the database type needs a save-like op (`{ modelName, id, data }`) by that name (or pass your own). `--batch-size` defaults to 5000, `--delimiter` to `,`; use `--dry-run` to report row/batch counts without writing and `--stop-on-error` to abort on the first failing chunk (default is best-effort continue).

For programmatic imports with per-row `transform` or progress callbacks, use `importCsv` from app code:

```swift
  let result = try await client.databases.importCsv(
    databaseId: databaseId,
    options: CsvImportOptions(
      csv: csvString, // provide csv or data (pre-parsed rows), not both
      modelName: "products",
      columnMap: ["Product Name": "name", "Unit Price": "price"],
      transform: { row, _ in
        guard let name = row["name"]?.stringValue, !name.isEmpty else {
          return nil // return nil to skip a row
        }
        var out = row
        out["importedAt"] = .string(ISO8601DateFormatter().string(from: Date()))
        return out
      },
      types: ["price": .number],
      idColumn: "sku",
      onProgress: { progress in
        print("\(progress.processed)/\(progress.total) processed")
      }
    )
  )
  // CsvImportResult: imported, failed, errors, indexesCreated, durationMs
```

Other options: `data` (pre-parsed rows, instead of `csv`), `delimiter`, `batchSize` (default 5000), `idGenerator` (per-row ID factory; the fallback chain is `idColumn` → `idGenerator` → generated ULID), `onBatchError` (return `false` to abort remaining batches), and `operationName` (the registered save op, default `"save"`, called as `{ modelName, id, data }`).


### Database design

- **Create multiple databases for isolation.** Each database is a separate isolated instance. Use separate databases for separate tenants, projects, or data domains to leverage per-database scaling.
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

- **Register indexes** on every field used in `filter` or `sort`. Without an index, the database falls back to scanning all records of that model.
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

```swift
  // Each user only sees their own items (the operation filters on $user.userId).
  let result = try await client.databases.executeOperation(
    databaseId: dbId, name: "myItems"
  )

  // Creates an item owned by the calling user; server assigns the id.
  let createResult = try await client.databases.executeOperation(
    databaseId: dbId, name: "createItem",
    options: ExecuteOperationOptions(params: ["title": "My Item"])
  )
  // executeOperation returns a JSONValue; the mutation result shape is
  // { results: [{ success, id }] } — read the server-assigned id from it.
  let itemId = createResult["results"]?.arrayValue?.first?["id"]?.stringValue // server-assigned ULID
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
| 409 from a mutation operation | One or more sub-ops in the batch failed (e.g., `ifNotExists` conflict) | Inspect the error message; mutation operations bundle all sub-ops into one `/batch` call and surface the first failure |
| `executeBatch` rejected with 400 "executeBatch only supports mutation operations" | Operation type is not `mutation` | Only `type = "mutation"` operations work with `executeBatch` |
| Records not found after save | Querying wrong `modelName` | Model names are case-sensitive collection identifiers |
| 422 `OPERATION_REFERENCES_UNDEFINED` on op create/edit | The op references a model or field not present in the type's `[models.*]` schema | Check the response's `refs` list; either fix the typo, or add the field to the schema. See [Schema gate](#schema-gate) |
| 422 `SCHEMA_BREAKS_OPERATIONS` on schema edit | A schema change would invalidate at least one existing op | Response lists the breaking ops + unresolved refs. Either reshape the schema or update the ops first |
| 422 `SCHEMA_HAS_UNCHECKABLE_OPS` on schema edit | At least one op has dynamic refs (e.g. `modelName = "$params.kind"`) the gate can't statically verify against the new schema | Confirm the dynamic refs are still consistent and re-run with `primitive sync push --accept-warnings` to commit |
| 409 `OPS_EXIST` on schema deletion | Removing the schema (`schema: null` via the API, or stripping all `[models.*]` blocks from the local file) is blocked while operations remain | Delete the registered operations first, then remove the schema |
| 413 `SCHEMA_TOO_LARGE` on schema edit | The inline schema exceeds the per-type cap | Trim the schema or split the model surface across multiple types |
