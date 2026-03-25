# Working with Documents

Documents are Primitive's local-first collaborative storage. A document is a container that holds your data models — synced across devices, shared with other users, and available offline. This guide covers document concepts, data modeling, and CRUD operations.

::: tip Framework Agnostic
The js-bao library is plain JavaScript/TypeScript and works with any framework. The Vue-specific examples (like `useJsBaoDataLoader`) are helpers from the template; the core APIs work everywhere.
:::

## Document Concepts

### Private by Default
Documents belong to a user and are private until explicitly shared. Sharing grants another user a permission level:

| Permission | Can View | Can Edit | Can Share | Can Delete |
|---|---|---|---|---|
| `reader` | Yes | | | |
| `read-write` | Yes | Yes | | |
| `owner` | Yes | Yes | Yes | Yes |

### Real-Time Sync
When multiple users have access to the same document, changes sync instantly. The system uses conflict-free data structures (CRDTs), so simultaneous edits merge cleanly.

### Offline Access
Data lives in a local browser database. Your app works without a network connection — changes queue and sync when connectivity returns.

### Size Guidelines
Documents work best under ~10MB each. For most apps this means thousands of records per document. If you need more, split data across multiple documents.

## Document Patterns

### Single Document (Personal Apps)
Each user gets one document that holds all their data. No document management UI needed.

**Best for:** Personal task managers, habit trackers, journal apps, budgeting tools.

```typescript
// Use getOrCreateWithAlias for atomic get-or-create
const result = await jsBaoClient.documents.getOrCreateWithAlias({
  title: "My Data",
  alias: { scope: "user", aliasKey: "default-doc" },
});
await jsBaoClient.documents.open(result.documentId);
```

### One Document at a Time (Workspaces)
Users have multiple documents but work in one at a time. They create, switch between, and share each independently.

**Best for:** Project management, accounting (one per company), shared shopping lists.

The `primitive-app` library provides `PrimitiveDocumentSwitcher` and `PrimitiveDocumentList` components for this pattern.

```typescript
const documents = await jsBaoClient.documents.list();
await jsBaoClient.documents.open(selectedDocumentId);
```

### Multiple Documents
The app manages multiple open documents simultaneously. Queries run across all open documents by default.

**Best for:** Chat apps (one document per channel), multi-tenant dashboards.

```typescript
// Open multiple documents
await Promise.all(
  channels.map((ch) => jsBaoClient.documents.open(ch.documentId))
);

// Query runs across all open documents
const messages = await Message.query({});
```

### The Root Document
Every user has a root document opened automatically by primitive-app. Use it only for user preferences (theme, last-used document ID). Never store application data in the root document.

## Defining Models

Models define the shape of your data. Each model corresponds to a record type — like `Task`, `Project`, or `Contact`.

### Creating a Model

**Step 1:** Create the model file:

```typescript
// src/models/Task.ts
import { BaseModel, defineModelSchema } from "js-bao";

const taskSchema = defineModelSchema({
  name: "tasks",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string", indexed: true },
    description: { type: "string", default: "" },
    completed: { type: "boolean", default: false },
    priority: { type: "number", default: 0 },
    dueDate: { type: "date" },
    tags: { type: "stringset", maxCount: 10 },
  },
});

export class Task extends BaseModel {
  static schema = taskSchema;

  get isOverdue(): boolean {
    if (!this.dueDate || this.completed) return false;
    return new Date(this.dueDate) < new Date();
  }
}
```

**Step 2:** Add the model to your config (`src/config/envConfig.ts`).

**Step 3:** Run `pnpm codegen` to generate TypeScript types and field accessors.

::: warning
Never edit auto-generated sections (marked with `// --- auto-generated ---`). They are overwritten by codegen.
:::

### Field Types

| Type | TypeScript | Description |
|---|---|---|
| `id` | `string` | Unique identifier. Use `autoAssign: true` for auto-generated IDs |
| `string` | `string` | Text data |
| `number` | `number` | Numeric data |
| `boolean` | `boolean` | True/false |
| `date` | `string` | Date/time as ISO-8601 string |
| `stringset` | `StringSet` | Set of strings (tags, categories) |

### Unique Constraints

```typescript
const categorySchema = defineModelSchema({
  name: "categories",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    name: { type: "string" },
    parentId: { type: "string" },
  },
  uniqueConstraints: [["name", "parentId"]],
});
```

## CRUD Operations

### Create

```typescript
const task = new Task({
  title: "Review pull request",
  priority: 2,
  dueDate: new Date().toISOString(),
});
await task.save();
```

In single-document mode, this saves to the active document automatically. Otherwise, specify a target:

```typescript
await task.save({ targetDocument: "doc-abc123" });
```

### Read

```typescript
// Find by ID
const task = await Task.find("task-id");

// Query with filters
const urgent = await Task.query({
  priority: { $gte: 2 },
  completed: false,
});

// Find first matching record
const topTask = await Task.queryOne(
  { completed: false },
  { sort: { priority: -1 } }
);

// Count
const remaining = await Task.count({ completed: false });
```

### Update

```typescript
const task = await Task.find("task-id");
if (task) {
  task.completed = true;
  await task.save();
}
```

### Delete

```typescript
const task = await Task.find("task-id");
if (task) {
  await task.delete();
}
```

### Upsert

```typescript
await Category.upsertByUnique(
  ["name", "parentId"],
  { name: "Work", parentId: null },
  { color: "blue" }
);
```

## Query Operators

| Operator | Description | Example |
|---|---|---|
| `$eq` | Equals | `{ status: { $eq: "active" } }` |
| `$ne` | Not equals | `{ status: { $ne: "deleted" } }` |
| `$gt` / `$gte` | Greater than (or equal) | `{ priority: { $gte: 2 } }` |
| `$lt` / `$lte` | Less than (or equal) | `{ dueDate: { $lt: new Date() } }` |
| `$in` / `$nin` | In / not in array | `{ status: { $in: ["pending", "active"] } }` |
| `$startsWith` | String prefix | `{ name: { $startsWith: "Project" } }` |
| `$containsText` | Case-insensitive contains | `{ title: { $containsText: "urgent" } }` |
| `$exists` | Field exists | `{ dueDate: { $exists: true } }` |
| `$contains` | StringSet contains value | `{ tags: { $contains: "tutorial" } }` |
| `$containsAny` | StringSet contains any | `{ tags: { $containsAny: ["js", "ts"] } }` |
| `$containsAll` | StringSet contains all | `{ tags: { $containsAll: ["tutorial", "advanced"] } }` |

### Logical Operators

```typescript
const results = await Task.query({
  $or: [
    { priority: 3 },
    { dueDate: { $lt: new Date() } },
  ],
});
```

## Sorting and Pagination

```typescript
// Sort (1 = ascending, -1 = descending)
const tasks = await Task.query(
  { completed: false },
  { sort: { priority: -1, createdAt: 1 } }
);

// Paginate
const page1 = await Task.query(
  { completed: false },
  { limit: 20, sort: { createdAt: -1 } }
);

if (page1.nextCursor) {
  const page2 = await Task.query(
    { completed: false },
    { limit: 20, sort: { createdAt: -1 }, uniqueStartKey: page1.nextCursor }
  );
}
```

## Loading Related Data

Use `include` to load related records alongside query results:

```typescript
const posts = await Post.query({}, {
  include: [
    { model: "users", type: "refersTo", sourceField: "authorId", as: "author" },
    { model: "comments", type: "hasMany", foreignKey: "postId", as: "comments", limit: 5 },
    { model: "tags", type: "refersToMany", sourceField: "tagIds", as: "tags" },
  ],
});
// posts[0]._related.author, posts[0]._related.comments, posts[0]._related.tags
```

## Aggregations

```typescript
const stats = await Task.aggregate({
  groupBy: ["category"],
  operations: [
    { type: "count" },
    { type: "avg", field: "priority" },
    { type: "sum", field: "estimatedHours" },
  ],
});
```

## Subscribing to Changes

Data can change from sync (another user edited it). Subscribe to keep your UI updated:

```typescript
const unsubscribe = Task.subscribe(() => {
  // Re-query and update UI
});
```

### Vue Data Loader

The template includes a `useJsBaoDataLoader` composable that handles subscriptions, document readiness, and reactive query parameters:

```typescript
const { data, initialDataLoaded } = useJsBaoDataLoader<{
  tasks: Task[];
}>({
  subscribeTo: [Task],
  queryParams: computed(() => ({ showCompleted: false })),
  documentReady,
  async loadData(queryParams) {
    const query = queryParams?.showCompleted ? {} : { completed: false };
    const result = await Task.query(query, { sort: { priority: -1 } });
    return { tasks: result.data as Task[] };
  },
});
```

Use `PrimitiveLoadingGate` in your template to show loading state until `initialDataLoaded` is true.

## Sharing Documents

```typescript
// Share via email invitation
await documentsStore.shareDocument(documentId, "colleague@example.com", "read-write");
```

The `primitive-app` library provides a `PrimitiveDocumentList` component with built-in sharing UI.

## Next Steps

- **[Choosing Your Data Model](./choosing-your-data-model.md)** — When to use documents vs. databases
- **[Working with Databases](./working-with-databases.md)** — Server-side structured storage
- **[Blobs and Files](./blobs-and-files.md)** — File storage within documents
