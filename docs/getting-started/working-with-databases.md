# Working with Databases

Primitive's server-side databases provide structured storage with registered operations, fine-grained access control, and server-enforced business rules. Unlike documents (which are local-first and collaborative), databases run entirely on the server — ideal for shared data, cross-user queries, and admin-controlled content.

## Core Concepts

### Server-Side SQLite
Each database has its own embedded SQLite instance running on the server. You get the familiarity of SQL with automatic scaling and no infrastructure to manage.

### Registered Operations
You don't write raw SQL. Instead, you define **registered operations** — named queries and mutations with specific parameters, access control expressions, and optional triggers. Operations are defined as TOML config files and synced via the CLI.

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
