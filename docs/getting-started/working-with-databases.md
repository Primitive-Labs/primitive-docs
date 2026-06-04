# Working with Databases

A database is an isolated, server-side data store. Each database is its own instance with its own storage — strong consistency and zero-config scaling. Unlike documents (which are local-first and collaborative), databases run entirely on the server — ideal for shared data, cross-user queries, and admin-controlled content.

## Key Properties

### Schemaless on the Server
Save any JSON records without upfront schema definition. There's no `CREATE TABLE` step — collections are created implicitly when you first write to them, and you can add new fields at any time without migrations. You can iterate fast and let your data model evolve alongside your application.

Databases work differently from documents: there are no client-side model classes here. **Registered operations are the client interface** — every read and write goes through an operation you define in the database-type TOML, and client-side codegen generates types over those *operations*, not over models. You can optionally declare a `[models.*]` schema in the TOML — not an enforced contract, but a map of the data that the server also uses to validate operations against your expectations (see [Schema Gate](#schema-gate-optional)).

### Organized by Type
A **database type** is a named configuration (operations, triggers, access rules) shared across many database instances. Think of it as a template: if you have one database per tenant, project, or team, they all share the same type — update the type once, and every instance inherits the changes. When you create a database with a type that doesn't exist yet, the type is auto-created.

An individual database holds up to ~5 GB; the per-tenant/per-project pattern above is also how you scale past it, since each instance gets its own isolated storage.

### Registered Operations
End-user data access goes through **registered operations** — named, parameterized queries and mutations with per-operation access control. You don't write raw queries in your app. Instead, you define operations as TOML config files and sync them via the CLI.

### CEL Access Expressions
Every operation has an access control expression written in [CEL (Common Expression Language)](https://github.com/google/cel-spec). These expressions determine who can execute each operation based on the authenticated user, their group memberships, and operation parameters.

## Quick Start

### 1. Create a Database

```bash
primitive databases create "Product Catalog" --type products
```

### 2. Define Operations

Pull your config directory, then define operations in `config/database-types/products.toml`:

```bash
primitive sync init --dir ./config
primitive sync pull --dir ./config
```

```toml
[type]
databaseType = "products"
timestamps = { create = "createdAt", update = "modifiedAt" }

[[operations]]
name = "list-products"
type = "query"
modelName = "product"
access = "true"
definition = '{"sort":{"name":1}}'

[[operations]]
name = "get-product"
type = "query"
modelName = "product"
access = "true"
definition = '{"filter":{"id":"$params.id"}}'
params = '{"id":{"type":"string","required":true}}'

[[operations]]
name = "create-product"
type = "mutation"
modelName = "product"
access = "isMemberOf('admin', database.celContext.adminGroupId)"
definition = '{"operations":[{"op":"save","data":{"name":"$params.name","price":"$params.price","createdBy":"$user.userId"}}]}'
params = '{"name":{"type":"string","required":true},"price":{"type":"number","required":true}}'
```

### 3. Push to Server

```bash
primitive sync push --dir ./config
```

### 4. Use in Your App

Every data access — queries, mutations, counts, aggregates — goes through `executeOperation(databaseId, operationName, { params })`. The operation name selects what runs; the operation's CEL `access` is the authorization point.

::: code-group

<<< ../../examples/databases/db-execute-operation.ts#example{ts} [JavaScript]

<<< ../../examples/databases/db-execute-operation.swift#example{swift} [Swift]

:::

The same call shape runs a mutation, a count, or any other registered op — just change the operation name and params. Callers can also override `limit`, `cursor`, and `direction` at call time (e.g. `{ params, limit: 20, cursor: previousCursor }`).

## Operation Types

### Queries
Return records, with optional parameters, filtering, sorting, and pagination.

```toml
[[operations]]
name = "search-products"
type = "query"
modelName = "product"
access = "true"
definition = '{"filter":{"name":{"$startsWith":"$params.search"}},"sort":{"name":1}}'
params = '{"search":{"type":"string","required":true}}'
```

**Response:** `{ data: [...records], hasMore: boolean, nextCursor?: string }`

### Mutations
Create, update, or delete records. Supports `save`, `patch`, `delete`, `increment`, `addToSet`, and `removeFromSet`.

```toml
[[operations]]
name = "update-product"
type = "mutation"
modelName = "product"
access = "hasRole('admin')"
definition = '{"operations":[{"op":"patch","id":"$params.id","data":{"name":"$params.name","price":"$params.price"}}]}'
params = '{"id":{"type":"string","required":true},"name":{"type":"string","required":true},"price":{"type":"number","required":true}}'
```

**Response:** `{ results: [{ success: boolean, id: string }] }`

### Counts
Return a single count value (`type = "count"`). **Response:** `{ count: number }`

### Apply-to-Query
Query-and-mutate in a single server-side operation — update every record matching a filter without round-tripping IDs through the client.

```toml
[[operations]]
name = "mark-overdue"
type = "applyToQuery"
modelName = "task"
access = "hasRole('admin')"
definition = '{"source":{"filter":{"dueDate":{"$lt":"$params.now"},"status":"pending"}},"action":{"op":"patch","data":{"status":"overdue"}}}'
params = '{"now":{"type":"string","required":true}}'
```

**Response:** `{ matched, affected, failed }` — when the definition sets a `source.limit`, the response also carries `truncated` and `appliedLimit`; if `truncated` is `true`, re-run until it returns `false`.

### Batch
Apply many individual writes in a single request by calling a regular mutation operation in bulk with `executeBatch`. The operation's `access` rule is re-evaluated against each item's params — if any item fails authorization the whole batch is rejected before any writes happen. The response is `{ imported, failed }`.

```toml
[[operations]]
name = "import-contacts"
type = "mutation"
modelName = "contact"
access = "params.createdBy == user.userId"
```

::: code-group

<<< ../../examples/databases/db-batch.ts#example{ts} [JavaScript]

<<< ../../examples/databases/db-batch.swift#example{swift} [Swift]

:::

### Aggregates
Return grouped or summarized data.

```toml
[[operations]]
name = "sales-by-category"
type = "aggregate"
modelName = "product"
access = "hasRole('admin')"
definition = '{"groupBy":["category"],"operations":[{"type":"sum","field":"price","outputField":"total"},{"type":"count","outputField":"count"}]}'
```

**Response:** `{ result: { "category-a": { total: 500, count: 10 }, ... } }`

### Pipelines
Chain multiple **read** operations, where later steps reference earlier results (`$steps.<name>.first`, `.first.<field>`, `.count`, `.results`):

```toml
[[operations]]
name = "order-with-product"
type = "pipeline"
modelName = "_pipeline"
access = "true"
definition = '{"steps":[{"name":"order","type":"query","modelName":"orders","filter":{"id":"$params.orderId"}},{"name":"product","type":"query","modelName":"product","filter":{"id":"$steps.order.first.productId"}}],"return":"all"}'
params = '{"orderId":{"type":"string","required":true}}'
```

Pipelines support `query`, `count`, and `aggregate` steps only. For read-then-mutate flows, run a pipeline to read, then call a separate mutation.

## Access Control with CEL

Every operation is gated by a CEL expression — the same access-control language used across the platform (see [Access Control](./access-control.md) for the concept and the identity context). On this page: the database-specific context and patterns.

```toml novalidate
# Anyone can access
access = "true"

# Only authenticated users
access = "user.userId != ''"

# Only app admins
access = "hasRole('admin')"

# Only members of a specific group
access = "isMemberOf('team', database.celContext.teamId)"

# Only the record owner
access = "params.createdBy == user.userId"
```

### Available CEL Variables

| Variable | Description |
|---|---|
| `user.userId` | The authenticated user's ID |
| `user.role` | The user's app role |
| `database.id` | The database instance ID |
| `database.celContext` | The database's CEL context object |
| `params.*` | Operation parameters |
| `isMemberOf(groupType, groupId)` | Check group membership |
| `memberGroups(groupType)` | List groups of a type the user belongs to |
| `hasRole(role)` | Check if the user has a specific app role |
| `fromWorkflow()` / `fromWorkflow(workflowKey)` | True when the call originated from a workflow (optionally a specific one) |

Use `fromWorkflow(...)` to gate an operation so only a specific workflow can invoke it — useful for cron-fired refreshes that no user, including admins, should call directly. The workflow identity is injected only by the internal workflow runner; clients cannot spoof it.

### Per-Parameter Access

Restrict who can set specific parameters by adding an `access` rule to the parameter itself:

```toml
params = '{"userId":{"type":"string","required":true},"role":{"type":"string","required":true,"access":"hasRole(\"super-admin\")"}}'
```

### Default Access

Set `defaultAccess` on the `[type]` config to apply a CEL rule to every operation that doesn't declare its own `access`. Without `defaultAccess` and no per-operation rule, the operation is denied to non-owner/manager callers.

```toml
[type]
databaseType = "project"
defaultAccess = "isMemberOf('team', database.celContext.teamId)"
```

## Server-Stamped Fields

Three mechanisms write fields server-side, from simplest to most flexible:

**`timestamps`** — stamp created/modified times on every record of a type. Field names are yours; either key can be omitted; add `models = [...]` to restrict to specific models.

```toml
[type]
databaseType = "orders"
timestamps = { create = "createdAt", update = "modifiedAt" }
```

**`autoPopulatedFields`** — CEL-resolved invariants (like `createdBy`) applied per op-kind across all models of a type. Each entry is a CEL string (stamps on create) or `{ value, on }` where `on` is `"create"`, `"update"`, or both:

```toml
[type.autoPopulatedFields]
ownerId   = "user.userId"
createdAt = { value = "now()", on = "create" }
updatedAt = { value = "now()", on = ["create", "update"] }
```

**Triggers** — per-model computed fields with conditions on the record's own data:

```toml
[triggers.orders]
triggers = [
  { on = "create", set = { createdBy = "user.userId" } },
  { on = "save", when = "record.status == 'complete' && record.completedAt == null", set = { completedAt = "now()" } },
]
```

`on` is `"create"`, `"update"`, or `"save"` (both); `when` is an optional CEL condition; `set` maps field names to CEL values. Trigger expressions see `user.*`, `record.*`, `database.*`, and `now()`.

Rule of thumb: `timestamps` for plain audit times, `autoPopulatedFields` for cross-model invariants, triggers when the rule depends on the record's data.

## Schema Gate (Optional)

Add `[models.<Name>.fields.<field>]` blocks to your database-type TOML to declare which models and fields the type's operations may reference. The database stays schemaless — this is a map of the data (for people and agents) plus a consistency check: with a schema present, the server rejects any operation edit that references an undeclared model or field (a filter on `nameTypo` instead of `name` fails at push time instead of silently returning broken data), and rejects schema edits that would invalidate existing operations.

```toml
[models.product.fields.id]
type = "id"
auto_assign = true
indexed = true

[models.product.fields.name]
type = "string"

[models.product.fields.priceCents]
type = "number"
indexed = true
```

To add a schema to an existing type with live data, scaffold it from the server — it infers field types from your operations and the live records, ready to review and push:

```bash
primitive databases schema generate inventory
```

::: tip No object/array field types
`[models.*.fields.*]` accepts `string`, `number`, `boolean`, `date`, `id`, and `stringset` — there's no object or array type. To store a structured payload, declare the field as a `string`, write JSON-encoded values, and parse where consumed.
:::

## TypeScript Codegen

Generate record interfaces and operation param/result types from your database-type TOML:

```bash
primitive databases codegen --sync-dir ./config --output ./src/generated/db
```

This reads the `[models.*]` blocks and `[[operations]]` definitions and emits typed interfaces — one per model, plus typed params and results per operation. Fields and params restricted to a fixed set of string values become TypeScript string-literal unions, so invalid values are caught at compile time (enum params are also validated server-side).

## Bulk CSV Import

Two paths for loading a lot of records. From app code, `client.databases.importCsv(databaseId, { csv, model, columnMap, ... })` imports a CSV string with column mapping, optional per-row transforms, and progress callbacks. From a terminal:

```bash
primitive databases import-csv <database-id> ./products.csv --model products \
  --column-map '{"Product Name":"name","Unit Price":"price"}' \
  --types '{"price":"number"}' --id-column SKU
```

The CLI loads rows through a registered batch save operation in batches; add `--dry-run` to preview counts without writing.

## Optional Filter Params

A `$params.fieldName` substitution in a filter is automatically optional: if the caller doesn't pass that parameter, the filter key is dropped entirely before the query runs. Any value the caller does pass — including `""`, `0`, `false`, and explicit `null` — is used verbatim. One operation can therefore handle both "list all" and "list filtered by X":

```toml
[[operations]]
name = "list-posts"
type = "query"
modelName = "posts"
access = "true"
definition = '{"filter":{"status":"approved","authorId":"$params.authorId"},"sort":{"createdAt":-1},"limit":50}'
params = '{"authorId":{"type":"string","required":false}}'
```

Reach for one operation with optional filter params before declaring a separate operation for each filter combination.

::: warning Declare every referenced param
If a filter references `$params.X` but `X` isn't declared in the operation's `params` block, the key is *always* dropped — the operation silently becomes a match-all for that field.
:::

For advanced filtering, substitution variables can also act as **boolean gates** when placed directly inside `$and`/`$or` arrays — a `false`/missing value short-circuits that branch without touching the database. This enables server-side feature flags (e.g. gate "see peers' posts" on a `database.celContext.peerVisibility` flag, or on a settings record read by an earlier pipeline step) with no client-side logic. A missing flag closes the gate, so the default is safe.

## Real-Time Subscriptions

Databases can push changes to connected clients over WebSocket — your app doesn't have to poll. The server sends a change frame to every subscribed client whenever matching rows change. Use subscriptions for live dashboards, collaborative databases, notification badges, and workflow-progress UIs.

### Registering a Subscription

Unlike documents (which sync a whole collaborative document), database subscriptions push **changes to individual rows**. Define them as `[[subscriptions]]` blocks in your database-type TOML, alongside operations — one definition serves every database of that type:

```toml
[[subscriptions]]
subscriptionKey = "my-open-tickets"
displayName = "My open tickets"
modelName = "ticket"
accessRule = "user.userId != ''"
filter = "record.data.assigneeId == user.userId && record.data.status == 'open'"
select = ["id", "title", "priority", "updatedAt"]
emit = ["enter", "update", "leave"]
```

Each subscription has:

- A **target model** (`modelName`, required)
- An **`accessRule`** — CEL, checked once at subscribe time; decides whether this user can subscribe at all. Has the full context: `user.*`, `database.*`, `isMemberOf`, `hasRole`, `params.*`.
- A **`filter`** — CEL, evaluated per change; only matches are delivered. Has a narrower context: `user.userId`, `record.*` (the post-write payload at `record.data.*`, the pre-write payload at `record.previousData.*`), and `params.*`. Use `"true"` to deliver every change in scope. The filter can only narrow what the access rule allows — and put database-context checks in `accessRule`, not `filter`.
- An optional **`select`** projection — fields you exclude never reach the wire, so this is how to keep sensitive columns off subscribers' machines.
- An optional **`emit`** list restricting which change types are delivered (`"enter"`, `"update"`, `"leave"`).

### Subscribing from Your App

`databases.subscribe(databaseId, subscriptionKey, { onChange })` returns an `unsub()` function:

```typescript
const unsub = client.databases.subscribe(databaseId, "my-open-tickets", {
  onChange: (event) => {
    if (event.isOrigin) {
      // This same tab wrote it — we already updated the UI optimistically.
      return;
    }
    for (const change of event.changes) {
      // change.op:         "save" | "patch" | "delete" | "increment" | ...
      // change.changeType: "enter" | "update" | "leave"
      // change.data, change.previousData (subject to the select projection)
      if (change.op === "delete") removeTicket(change.id);
      else upsertTicket(change.data);
    }
  },
});

// Later
unsub();
```

The usual pattern is **load + subscribe**: run a query operation once for current state, then subscribe for future changes.

Every change frame carries origin attribution so consumers can tell who wrote it:

| Field | Meaning |
|---|---|
| `originConnectionId` / `originUserId` | The writer's connection and user (or `null` for server-side writes like workflows and cron) |
| `isOrigin` | `true` when this specific tab/process produced the write — suppress the echo, you already updated optimistically |
| `isOriginUser` | `true` when any session of the current user produced the write — use for cross-tab cache invalidation |

### Parameterized Subscriptions

Declare a params schema on the subscription, then bind values at subscribe time — the bound `params.*` are visible to both `accessRule` and `filter`:

```toml
[[subscriptions]]
subscriptionKey = "tickets-by-team"
displayName = "Tickets by team"
modelName = "ticket"
accessRule = "isMemberOf('team', params.teamId)"
filter = "record.data.teamId == params.teamId"
[subscriptions.params]
teamId = { type = "string", required = true }
```

```typescript
const unsub = client.databases.subscribe(databaseId, "tickets-by-team", {
  params: { teamId: "eng" },
  onChange: (event) => { /* ... */ },
});
```

### Server-Side Writes

Subscriptions fan out **every** write through a registered operation, no matter who made it — another user's client, a cron-fired workflow, a webhook handler. Server-side writes arrive with `originConnectionId: null`, `originUserId: null`, and both origin flags `false`.

### Delivery Behavior

- **No guaranteed replay** — if a client disconnects, changes during the gap are not re-delivered. Re-load on reconnect via your usual query operation.
- The writer's own connection receives the frame like any other subscriber — use `isOrigin` to suppress the echo.

## Listing and Discovering Databases

### `databases.list()` — Owner and Manager Only

`databases.list()` returns only databases where the current user has a direct permission grant (`owner` or `manager`). It does **not** return databases the user can access through registered operations and CEL rules.

::: warning
If your app relies on `databases.list()` to populate a dashboard, invited team members who interact with databases solely through registered operations won't see those databases — even with full operational access. Discover shared databases through group memberships instead (below).
:::

::: code-group

<<< ../../examples/databases/db-list-get.ts#example{ts} [JavaScript]

<<< ../../examples/databases/db-list-get.swift#example{swift} [Swift]

:::

### `databases.get()` — Any Authenticated User

Unlike `list()`, `databases.get(databaseId)` works for any authenticated user who knows the database ID — no owner/manager permission required. It also resolves **group-based** access, so users who only have access through a shared group can still load database metadata.

### Group-Based Database Access

A database can be shared with an entire group, mirroring the document-sharing model:

::: code-group

<<< ../../examples/databases/db-grant-group.ts#example{ts} [JavaScript]

<<< ../../examples/databases/db-grant-group.swift#example{swift} [Swift]

:::

Members of the group can then call `databases.get(databaseId)` and execute operations. (`databases.list()` deliberately does not include group-access databases — like documents, the list is "things I directly own"; discovery of shared things happens through groups and collections.)

### Discovering Databases via Group Memberships

For apps where databases are shared with teams, use group memberships to discover accessible databases. The common pattern is to use the database ID as the group ID, so the user's memberships directly yield their database IDs:

::: code-group

<<< ../../examples/databases/db-discover.ts#example{ts} [JavaScript]

<<< ../../examples/databases/db-discover.swift#example{swift} [Swift]

:::

When setting up a workspace, create the group using the database ID returned from `databases.create()`:

::: code-group

<<< ../../examples/databases/db-create-workspace.ts#example{ts} [JavaScript]

<<< ../../examples/databases/db-create-workspace.swift#example{swift} [Swift]

:::

This pattern is especially useful in multi-tenant apps where each team or project has its own database and group, and users get access through group membership rather than direct database permissions.

## Common Patterns

### User-Scoped Data
Let users query their own records:

```toml
[[operations]]
name = "my-orders"
type = "query"
modelName = "orders"
access = "params.userId == user.userId"
definition = '{"filter":{"userId":"$params.userId"},"sort":{"createdAt":-1}}'
params = '{"userId":{"type":"string","required":true}}'
```

### Admin + User Access
Admins see everything, users see their own — two operations over the same model:

```toml
[[operations]]
name = "list-orders-admin"
type = "query"
modelName = "orders"
access = "hasRole('admin')"
definition = '{"sort":{"createdAt":-1}}'

[[operations]]
name = "list-orders-user"
type = "query"
modelName = "orders"
access = "params.userId == user.userId"
definition = '{"filter":{"userId":"$params.userId"},"sort":{"createdAt":-1}}'
params = '{"userId":{"type":"string","required":true}}'
```

## Debugging Slow Operations

Pass `timing: true` to `executeOperation` and the response includes a `_timing` object with per-phase millisecond breakdowns (validation, CEL evaluation, query execution, response processing). Available on all operation types.

## Next Steps

- **[Choosing Your Data Model](./choosing-your-data-model.md)** — When to use databases vs. documents
- **[Users and Groups](./users-and-groups.md)** — Set up groups for database access control
- **[Workflows](./workflows.md)** — Multi-step server-side automation
- **[Primitive CLI](./primitive-cli.md)** — Full CLI reference for database management
