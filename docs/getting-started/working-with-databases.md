# Working with Databases

A database is a server-side data store backed by a Cloudflare Durable Object with SQLite. Each database is an isolated instance with its own storage — strong consistency and zero-config scaling. Unlike documents (which are local-first and collaborative), databases run entirely on the server — ideal for shared data, cross-user queries, and admin-controlled content.

## Key Properties

### Schemaless
Save any JSON records without upfront schema definition. There's no `CREATE TABLE` step — collections are created implicitly when you first write to them, and you can add new fields at any time without migrations. This means you can iterate fast, ship changes without coordinating schema updates, and let your data model evolve naturally alongside your application.

### Organized by Type
A **database type** is a named configuration (operations, triggers, access rules) shared across many database instances. Think of it as a template: if you have one database per tenant, project, or team, they all share the same type — update the type once, and every instance inherits the changes. When you create a database with a type that doesn't exist yet, the type is auto-created.

### Registered Operations
End-user data access goes through **registered operations** — named, parameterized queries and mutations with per-operation access control. You don't write raw SQL in your app. Instead, you define operations as TOML config files and sync them via the CLI.

### CEL Access Expressions
Every operation has an access control expression written in [CEL (Common Expression Language)](https://github.com/google/cel-spec). These expressions determine who can execute each operation based on the authenticated user, their group memberships, and operation parameters.

## Quick Start

### 1. Create a Database

```bash
# Set your app context
primitive use "My App"

# Create a database
primitive databases create "Product Catalog" --type products
```

### 2. Define Operations

Create a TOML config file for your database type:

```bash
# Initialize config directory
primitive sync init --dir ./config

# Pull existing config
primitive sync pull --dir ./config
```

Then define operations in `config/database-types/products.toml`:

```toml
[type]
databaseType = "products"

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

[[operations]]
name = "count-products"
type = "count"
modelName = "product"
access = "true"
definition = '{}'
```

### 3. Push to Server

```bash
primitive sync push --dir ./config
```

### 4. Use in Your App

```typescript
import { jsBaoClientService } from "primitive-app";

const client = await jsBaoClientService.getClientAsync();

// List products
const { data: products } = await client.databases.executeOperation(databaseId, "list-products");

// Get a single product
const { data: [product] } = await client.databases.executeOperation(
  databaseId, "get-product",
  { params: { id: "prod-123" } }
);

// Create a product (requires admin group membership)
await client.databases.executeOperation(databaseId, "create-product", {
  params: {
    name: "Widget",
    price: 29.99,
  },
});

// Count products
const { count } = await client.databases.executeOperation(databaseId, "count-products");
```

## Operation Types

### Queries
Return records from the database. Can include parameters, sorting, filtering, and pagination.

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

Callers can override `limit`, `cursor`, and `direction` at call time:

```typescript
const { data, hasMore, nextCursor } = await client.databases.executeOperation(
  databaseId, "search-products",
  { params: { search: "widget" }, limit: 20, cursor: previousCursor }
);
```

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
Return a single count value. **Response:** `{ count: number }`

### Apply-to-Query
Query-and-mutate in a single server-side operation. Useful when you need to update every record matching a filter without round-tripping the IDs through the client.

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

**Response:** `{ matched: number, updated: number, truncated: boolean }`

If the query matches more records than the server's per-call cap, `truncated` is `true` and you should re-run the operation until it returns `truncated: false`.

### Batch
Apply many individual writes in a single request, with CEL access checked per-item.

```toml
[[operations]]
name = "import-contacts"
type = "executeBatch"
modelName = "contact"
access = "hasRole('admin')"
itemAccess = "params.createdBy == user.userId"
```

Each item in the batch is checked against `itemAccess` independently — a single failing item doesn't fail the whole batch.

```typescript
await client.databases.executeOperation(databaseId, "import-contacts", {
  items: [
    { op: "save", data: { name: "Alice", email: "alice@example.com", createdBy: userId } },
    { op: "save", data: { name: "Bob", email: "bob@example.com", createdBy: userId } },
  ],
});
```

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

## Access Control with CEL

CEL expressions give you fine-grained control over who can execute each operation.

### Common Patterns

```toml
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

# Members of any of these groups
access = """isMemberOf('admin', 'admins') || isMemberOf('team', database.celContext.teamId)"""
```

### Available CEL Variables

| Variable | Description |
|---|---|
| `user.userId` | The authenticated user's ID |
| `user.role` | The user's app role |
| `database.id` | The database instance ID |
| `database.celContext` | The database's CEL context object (also accessible as `database.metadata`) |
| `params.*` | Operation parameters |
| `isMemberOf(groupType, groupId)` | Check group membership |
| `memberGroups(groupType)` | List groups of a type the user belongs to |
| `hasRole(role)` | Check if the user has a specific app role |

### Per-Parameter Access

Restrict who can set specific parameters:

```toml
[[operations]]
name = "update-user-role"
type = "mutation"
modelName = "app_user"
access = "hasRole('admin')"
definition = '{"operations":[{"op":"patch","id":"$params.userId","data":{"role":"$params.role"}}]}'
params = '{"userId":{"type":"string","required":true},"role":{"type":"string","required":true,"access":"hasRole(\"super-admin\")"}}'
```

## Triggers

Triggers are computed fields that run automatically before a record is saved. Configure them per model in the database type TOML:

```toml
[triggers.orders]
triggers = [
  { on = "create", set = { createdAt = "now()", createdBy = "user.userId" } },
  { on = "update", set = { modifiedAt = "now()" } },
  { on = "save", when = "record.status == 'complete' && record.completedAt == null", set = { completedAt = "now()" } },
]
```

| Field | Description |
|---|---|
| `on` | When to fire: `"create"`, `"update"`, or `"save"` (both) |
| `when` | Optional CEL condition — trigger only fires if true |
| `set` | Map of field name to CEL expression value |

**Available in trigger expressions:** `user.userId`, `user.role`, `record.*`, `database.id`, `database.celContext` (also `database.metadata`), `now()`

## Pipelines

Chain multiple read operations together, where later steps can reference results from earlier ones:

```toml
[[operations]]
name = "order-with-product"
type = "pipeline"
modelName = "_pipeline"
access = "true"
definition = '{"steps":[{"name":"order","type":"query","modelName":"orders","filter":{"id":"$params.orderId"}},{"name":"product","type":"query","modelName":"product","filter":{"id":"$steps.order.first.productId"}}],"return":"all"}'
params = '{"orderId":{"type":"string","required":true}}'
```

**Pipeline step references:**

| Variable | Description |
|---|---|
| `$steps.stepName.first` | First record from a query step |
| `$steps.stepName.first.field` | A field from the first record |
| `$steps.stepName.count` | Record count from a query or count step |
| `$steps.stepName.results` | Full results of the step |

::: warning
Pipelines are **read-only** — they support `query`, `count`, and `aggregate` steps only. For read-then-mutate flows, execute a pipeline to read the data, then call a separate mutation operation.
:::

## Optional Filter Fields

A `$params.fieldName` substitution in a filter is automatically optional: if the caller doesn't pass that parameter, the filter key is dropped before the query reaches the database — an unset substitution doesn't become `{field: undefined}` in the dispatched filter, it's removed entirely. Any value the caller does pass is used verbatim — including falsy values like `""`, `0`, `false`, and explicit `null`. Only a missing parameter removes the key.

This lets a single operation handle both "list all" and "list filtered by X" cases:

```toml
[[operations]]
name = "list-posts"
type = "query"
modelName = "posts"
access = "true"
definition = '{"filter":{"status":"approved","authorId":"$params.authorId"},"sort":{"createdAt":-1},"limit":50}'
params = '{"authorId":{"type":"string","required":false}}'
```

| Caller passes | Filter becomes | Result |
|---|---|---|
| nothing | `{"status":"approved"}` | All approved posts |
| `{authorId: "user-123"}` | `{"status":"approved","authorId":"user-123"}` | Approved posts by that author |
| `{authorId: ""}` | `{"status":"approved","authorId":""}` | Approved posts where `authorId` is literally `""` |

The same rule applies to pipeline step filters, and to `$database.celContext.*` and `$steps.*` references — anywhere a substitution variable can appear, a missing value drops the key and a provided value is passed through as-is. (`$database.metadata.*` is accepted as a legacy alias.)

::: tip
Reach for one operation with optional filter params before declaring a separate operation for each filter combination. `"required": false` scales cleanly as filter options grow.
:::

::: warning
If a filter references `$params.X` but `X` isn't declared in the operation's `params` block, the key is always dropped — the operation silently becomes a match-all for that field. Make sure every `$params.*` reference has a matching `params` entry.
:::

## Conditional Filters (Boolean Gates)

Substitution variables like `$database.celContext.*`, `$params.*`, or `$steps.*` can be placed **directly as elements** inside `$and` or `$or` filter arrays. When a variable resolves to a boolean, `null`, or is missing, it controls whether that branch executes — without touching the database:

| Value in array | In `$and` | In `$or` |
|---|---|---|
| `true` | No-op — remaining conditions apply | Short-circuits to match-all |
| `false` / `null` / missing | Short-circuits to no-match (empty result, no DB hit) | Removed — remaining branches apply |

This is useful for server-side feature flags that toggle visibility without any client-side logic:

```toml
[[operations]]
name = "list-posts"
type = "query"
modelName = "posts"
access = "isMemberOf('class-students', database.id)"
definition = '{"filter":{"$or":[{"authorId":"$user.userId"},{"$and":["$database.celContext.peerVisibility",{"status":"approved"}]}]}}'
```

When `database.celContext.peerVisibility` is `true`, students see their own posts plus all approved posts. When it's `false` or not set, the `$and` branch short-circuits to no-match — students only see their own posts.

Combined with the settings record pattern, you can make this dynamic without redeploying. Gate on a pipeline step result:

```toml
definition = '{"steps":[{"name":"settings","type":"query","modelName":"settings","filter":{"key":"class-settings"},"limit":1},{"name":"posts","type":"query","modelName":"posts","filter":{"$or":[{"authorId":"$user.userId"},{"$and":["$steps.settings.first.peerVisible",{"status":"approved"}]}]}}],"return":"posts"}'
```

When the settings record has `peerVisible: true`, the gate opens. When missing or `false`, the gate closes and students only see their own posts.

::: tip
A missing CEL context key (`$database.celContext.nonExistent` → `null`) naturally closes the gate. This makes the default safe — no content is exposed before the flag is explicitly set.
:::

## Real-Time Subscriptions

Databases can push changes to connected clients over WebSocket — your app doesn't have to poll. Define a subscription in your type config, subscribe from the client, and the server fans out change events to every connection whose filter matches.

```toml
[[subscriptions]]
name = "my-open-tickets"
modelName = "ticket"
access = "user.userId != ''"
filter = "record.assigneeId == user.userId && record.status == 'open'"
```

```typescript
const sub = await client.databases
  .database(databaseId)
  .subscribe("my-open-tickets");

sub.on("change", (event) => {
  // event.op: "save" | "patch" | "delete"
  // event.before / event.after
  applyChange(event);
});
```

Writes from workflows fan out to subscriptions the same way as writes from clients — making this the primary pattern for live "workflow progress" UIs.

See [Scheduled and Real-Time Automation](./scheduled-and-realtime-automation.md) for the full walkthrough including parameterized subscriptions, access enforcement, and reconnection behavior.

## Listing and Discovering Databases

### `databases.list()` — Owner and Manager Only

`databases.list()` returns only databases where the current user has a direct permission grant (`owner` or `manager`). It does **not** return databases that the user can access through registered operations and CEL-based access rules.

::: warning
If your app relies on `databases.list()` to populate a dashboard or workspace list, invited team members who interact with databases solely through registered operations will not see those databases — even if they have full operational access. This can cause databases to appear "missing" for non-owner users.
:::

```typescript
// Only returns databases where the user is owner or manager
const databases = await client.databases.list();

// Filter to one databaseType — wire shape: ?type=<databaseType>
const projects = await client.databases.list({ databaseType: "project" });
```

The same `{ databaseType }` filter applies for app-level admins, who otherwise see every database in the app.

### `databases.get()` — Any Authenticated User

Unlike `list()`, `databases.get(databaseId)` is available to any authenticated user who knows the database ID. It does not require owner or manager permission. `databases.get()` also resolves **group-based** access via `DatabaseGroupPermission` (see below), so users who only have access through a shared group can still load database metadata.

```typescript
// Works for any authenticated user — no owner/manager permission required
const db = await client.databases.get(databaseId);
```

### Group-Based Database Access

Alongside direct permission grants, a database can be shared with an entire group using `DatabaseGroupPermission`. This mirrors the document-sharing model:

```typescript
await client.databases.setGroupPermission(databaseId, {
  groupType: "team",
  groupId: "engineering",
  permission: "manager",
});
```

Members of the group can then call `databases.get(databaseId)` and execute operations. Note that `databases.list()` deliberately does **not** include group-access databases — this matches the documents semantics, where the list is "things I directly own" and discovery of shared things happens through another channel (group memberships, bookmarks, or a shared link).

### Discovering Databases via Group Memberships

For apps where databases are shared with teams through registered operations (not direct permissions), use group memberships to discover accessible databases. The common pattern is to use the database ID as the group ID, so the user's group memberships directly give you the database IDs.

```typescript
import { jsBaoClientService } from "primitive-app";

const client = await jsBaoClientService.getClientAsync();

// 1. Get the current user's group memberships
const memberships = await client.groups.listUserMemberships(currentUser.userId);

// 2. Filter to the group type that represents your workspaces/projects
const workspaceGroups = memberships.filter(m => m.groupType === "workspace");

// 3. Each group ID is also the database ID — load them directly
const databases = await Promise.all(
  workspaceGroups.map(group => client.databases.get(group.groupId))
);
```

This works because the group ID and database ID share the same value by convention. When setting up a workspace, create the group using the database ID returned from `databases.create()`:

```typescript
// Create the database (ID is assigned by the server)
const db = await client.databases.create({
  title: "Team Workspace",
  databaseType: "workspace",
});

// Create the group using the database ID as the group ID
await client.groups.create({
  groupType: "workspace",
  groupId: db.databaseId,
  name: "Team Workspace Members",
});
await client.groups.addMember("workspace", db.databaseId, { userId: currentUser.userId });
```

This pattern is especially useful in multi-tenant apps where each team or project has its own database and group, and users are granted access through group membership rather than direct database permissions.

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
Admins see everything, users see their own:

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

## Operation Timing

To debug slow operations, pass `timing: true` to `executeOperation`. The response includes a `_timing` object with per-phase millisecond breakdowns:

```typescript
const result = await client.databases.executeOperation(databaseId, "list-products", {
  params: { search: "widget" },
  timing: true,
});
console.log(result._timing);
// { totalMs: 45.2, databaseLookup: 3.1, operationLookup: 2.8, validation: 0.4,
//   celEvaluation: 1.3, doInvocation: 25.8, responseProcessing: 1.9 }
```

Timing is available on all operation types: query, mutation, count, aggregate, and pipeline.

## Next Steps

- **[Choosing Your Data Model](./choosing-your-data-model.md)** — When to use databases vs. documents
- **[Users and Groups](./users-and-groups.md)** — Set up groups for database access control
- **[Scheduled and Real-Time Automation](./scheduled-and-realtime-automation.md)** — Subscriptions and cron-triggered workflows
- **[Primitive CLI](./primitive-cli.md)** — Full CLI reference for database management
