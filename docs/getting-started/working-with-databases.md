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
primitive databases create --name "products" --display-name "Product Catalog"
```

### 2. Define Operations

Create a TOML config file for your database operations:

```bash
# Initialize config directory
primitive sync init --dir ./config

# Pull existing config
primitive sync pull --dir ./config
```

Then define operations in `config/databases/products.toml`:

```toml
[database]
name = "products"
displayName = "Product Catalog"

[[types]]
name = "product"
displayName = "Product"

[[types.operations]]
name = "list-products"
operationType = "query"
sql = "SELECT * FROM product ORDER BY name ASC"
access = "true"  # Anyone can list

[[types.operations]]
name = "get-product"
operationType = "query"
sql = "SELECT * FROM product WHERE id = :id"
access = "true"
params = [{ name = "id", type = "TEXT", required = true }]

[[types.operations]]
name = "create-product"
operationType = "mutation"
sql = "INSERT INTO product (id, name, price, createdBy) VALUES (:id, :name, :price, :createdBy)"
access = "isMemberOf('admin')"  # Only admins can create
params = [
  { name = "id", type = "TEXT", required = true },
  { name = "name", type = "TEXT", required = true },
  { name = "price", type = "REAL", required = true },
  { name = "createdBy", type = "TEXT", required = true },
]

[[types.operations]]
name = "count-products"
operationType = "count"
sql = "SELECT COUNT(*) as count FROM product"
access = "true"
```

### 3. Push to Server

```bash
primitive sync push --dir ./config
```

### 4. Use in Your App

```typescript
import { jsBaoClientService } from "primitive-app";

const client = await jsBaoClientService.getClientAsync();
const db = client.databases;

// List products
const { records } = await db.executeOperation("products", "product", "list-products");

// Get a single product
const { records: [product] } = await db.executeOperation(
  "products", "product", "get-product",
  { id: "prod-123" }
);

// Create a product (requires admin group membership)
await db.executeOperation("products", "product", "create-product", {
  id: crypto.randomUUID(),
  name: "Widget",
  price: 29.99,
  createdBy: currentUser.userId,
});

// Count products
const { count } = await db.executeCount("products", "product", "count-products");
```

## Operation Types

### Queries
Return rows from the database. Can include parameters and pagination.

```toml
[[types.operations]]
name = "search-products"
operationType = "query"
sql = "SELECT * FROM product WHERE name LIKE '%' || :search || '%' ORDER BY name LIMIT :limit OFFSET :offset"
access = "true"
params = [
  { name = "search", type = "TEXT", required = true },
  { name = "limit", type = "INTEGER", required = false },
  { name = "offset", type = "INTEGER", required = false },
]
```

### Mutations
Insert, update, or delete records.

```toml
[[types.operations]]
name = "update-product"
operationType = "mutation"
sql = "UPDATE product SET name = :name, price = :price WHERE id = :id"
access = "isMemberOf('admin')"
params = [
  { name = "id", type = "TEXT", required = true },
  { name = "name", type = "TEXT", required = true },
  { name = "price", type = "REAL", required = true },
]
```

### Counts
Return a single count value.

### Aggregates
Return grouped or summarized data.

```toml
[[types.operations]]
name = "sales-by-category"
operationType = "aggregate"
sql = "SELECT category, SUM(price) as total, COUNT(*) as count FROM product GROUP BY category"
access = "isMemberOf('admin')"
```

## Access Control with CEL

CEL expressions give you fine-grained control over who can execute each operation.

### Common Patterns

```toml
# Anyone can access
access = "true"

# Only authenticated users
access = "userId != ''"

# Only members of a specific group
access = "isMemberOf('admin')"

# Only the record owner
access = "params.createdBy == userId"

# Members of any of these groups
access = "isMemberOf('admin') || isMemberOf('editor')"

# Group members with a specific role
access = "hasGroupRole('team-123', 'manager')"
```

### Available CEL Variables

| Variable | Description |
|---|---|
| `userId` | The authenticated user's ID |
| `params.*` | Operation parameters |
| `isMemberOf(groupId)` | Check group membership |
| `hasGroupRole(groupId, role)` | Check group membership with a specific role |
| `memberGroups(groupTypeId)` | List groups of a type the user belongs to |

### Per-Parameter Access

Restrict who can set specific parameters:

```toml
[[types.operations]]
name = "update-user-role"
operationType = "mutation"
sql = "UPDATE app_user SET role = :role WHERE id = :userId"
access = "isMemberOf('admin')"
params = [
  { name = "userId", type = "TEXT", required = true },
  { name = "role", type = "TEXT", required = true, access = "isMemberOf('super-admin')" },
]
```

## Triggers

Triggers run server-side SQL before or after an operation, enabling computed fields, validation, and side effects.

```toml
[[types.operations]]
name = "create-order"
operationType = "mutation"
sql = "INSERT INTO orders (id, productId, quantity, userId) VALUES (:id, :productId, :quantity, :userId)"
access = "userId != ''"
params = [
  { name = "id", type = "TEXT", required = true },
  { name = "productId", type = "TEXT", required = true },
  { name = "quantity", type = "INTEGER", required = true },
  { name = "userId", type = "TEXT", required = true },
]

[[types.operations.triggers]]
timing = "after"
sql = "UPDATE product SET stock = stock - :quantity WHERE id = :productId"
```

## Pipelines

Chain multiple read operations together, where later steps can reference results from earlier ones:

```toml
[[types.operations]]
name = "order-with-product"
operationType = "pipeline"

[[types.operations.steps]]
name = "order"
sql = "SELECT * FROM orders WHERE id = :orderId"
params = [{ name = "orderId", type = "TEXT", required = true }]

[[types.operations.steps]]
name = "product"
sql = "SELECT * FROM product WHERE id = :productId"
inputSelectors = { productId = "order.productId" }
```

## Listing and Discovering Databases

### `databases.list()` — Owner and Manager Only

`databases.list()` returns only databases where the current user has a direct permission grant (`owner` or `manager`). It does **not** return databases that the user can access through registered operations and CEL-based access rules.

::: warning
If your app relies on `databases.list()` to populate a dashboard or workspace list, invited team members who interact with databases solely through registered operations will not see those databases — even if they have full operational access. This can cause databases to appear "missing" for non-owner users.
:::

```typescript
// Only returns databases where the user is owner or manager
const databases = await client.databases.list();
```

App-level admins (console admins) are an exception — they see all databases in the app.

### `databases.get()` — Any Authenticated User

Unlike `list()`, `databases.get(databaseId)` is available to any authenticated user who knows the database ID. It does not require owner or manager permission. This makes it suitable for loading database details when you already have the ID from another source (e.g., group metadata or a shared link).

```typescript
// Works for any authenticated user — no owner/manager permission required
const db = await client.databases.get(databaseId);
```

### Discovering Databases via Group Memberships

For apps where databases are shared with teams through registered operations (not direct permissions), use group memberships to discover accessible databases. A common pattern is to store the database ID in group metadata, then look up the user's groups to find their databases.

```typescript
import { jsBaoClientService } from "primitive-app";

const client = await jsBaoClientService.getClientAsync();

// 1. Get the current user's group memberships
const memberships = await client.groups.listUserMemberships(currentUser.userId);

// 2. Filter to the group type that represents your workspaces/projects
const workspaceGroups = memberships.filter(m => m.groupType === "workspace");

// 3. Load each database using the group's metadata
const databases = await Promise.all(
  workspaceGroups.map(async (group) => {
    // Assumes the database ID is stored in group metadata
    const groupDetails = await client.groups.get(group.groupType, group.groupId);
    const databaseId = groupDetails.metadata?.databaseId;
    if (databaseId) {
      return client.databases.get(databaseId);
    }
    return null;
  })
);

const accessibleDatabases = databases.filter(Boolean);
```

This pattern is especially useful in multi-tenant apps where each team or project has its own database and group, and users are granted access through group membership rather than direct database permissions.

## Common Patterns

### User-Scoped Data
Let users query their own records:

```toml
[[types.operations]]
name = "my-orders"
operationType = "query"
sql = "SELECT * FROM orders WHERE userId = :userId ORDER BY createdAt DESC"
access = "params.userId == userId"
params = [{ name = "userId", type = "TEXT", required = true }]
```

### Admin + User Access
Admins see everything, users see their own:

```toml
[[types.operations]]
name = "list-orders-admin"
operationType = "query"
sql = "SELECT * FROM orders ORDER BY createdAt DESC"
access = "isMemberOf('admin')"

[[types.operations]]
name = "list-orders-user"
operationType = "query"
sql = "SELECT * FROM orders WHERE userId = :userId ORDER BY createdAt DESC"
access = "params.userId == userId"
params = [{ name = "userId", type = "TEXT", required = true }]
```

## Next Steps

- **[Choosing Your Data Model](./choosing-your-data-model.md)** — When to use databases vs. documents
- **[Users and Groups](./users-and-groups.md)** — Set up groups for database access control
- **[Primitive CLI](./primitive-cli.md)** — Full CLI reference for database management
