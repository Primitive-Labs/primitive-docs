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

Models define the shape of your data. Each model corresponds to a record type — like `Task`, `Project`, or `Contact`. Models are authored in TOML and TypeScript classes are generated from that file.

The full authoring loop — field types, options, relationships, uniqueness, schema evolution, and the migration tool from older `defineModelSchema()`-based projects — is covered in [Defining Your Models](./defining-your-models.md). The summary below is enough to start using models in CRUD code on this page.

### Quick Reference

**Step 1:** Add the model to `src/models/models.toml`:

```toml
[models.tasks.fields.id]
type = "id"
auto_assign = true
indexed = true

[models.tasks.fields.title]
type = "string"
indexed = true

[models.tasks.fields.completed]
type = "boolean"
default = false

[models.tasks.fields.priority]
type = "number"
default = 0

[models.tasks.fields.due_date]
type = "date"

[models.tasks.fields.tags]
type = "stringset"
max_count = 10
```

**Step 2:** Run `pnpm codegen` to regenerate `src/models/Task.generated.ts` and the `src/models/index.ts` barrel.

**Step 3:** Import from the barrel and use the model:

```typescript
import { Task } from "@/models";

const task = new Task({ title: "Review PR", priority: 2 });
await task.save();
```

::: warning
Never edit `*.generated.ts` files or `src/models/index.ts` — they are overwritten on every `pnpm codegen` run. Always import models from `@/models`, never directly from a generated file.
:::

### Field Types

| Type | TypeScript | Description |
|---|---|---|
| `id` | `string` | Unique identifier. Use `auto_assign = true` for auto-generated IDs |
| `string` | `string` | Text data |
| `number` | `number` | Numeric data |
| `boolean` | `boolean` | True/false |
| `date` | `string` | Date/time as ISO-8601 string |
| `stringset` | `StringSet` | Set of strings (tags, categories) |

See [Defining Your Models](./defining-your-models.md) for full field-option reference, unique constraints, and relationships.

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

### Upsert by Natural Key

Use the `upsertOn` option to save-or-update by a natural unique field (such as `email` or `slug`) without needing to know the existing record's ID. The field must have a single-field unique constraint.

```typescript
const user = new User({ email: "alice@example.com", name: "Alice" });
// Creates a new record, or merges into the existing one with that email
await user.save({ upsertOn: "email" });
```

When a match is found, the save returns the existing record's ID. Only the fields you provided are updated — all other existing fields are preserved.

## Query Operators

| Operator | Description | Example |
|---|---|---|
| `$eq` | Equals | `{ status: { $eq: "active" } }` |
| `$ne` | Not equals | `{ status: { $ne: "deleted" } }` |
| `$gt` / `$gte` | Greater than (or equal) | `{ priority: { $gte: 2 } }` |
| `$lt` / `$lte` | Less than (or equal) | `{ dueDate: { $lt: new Date() } }` |
| `$in` / `$nin` | In / not in array | `{ status: { $in: ["pending", "active"] } }` |
| `$startsWith` | String prefix | `{ name: { $startsWith: "Project" } }` |
| `$endsWith` | String suffix | `{ name: { $endsWith: ".md" } }` |
| `$containsText` | Case-insensitive contains | `{ title: { $containsText: "urgent" } }` |
| `$exists` | Field exists | `{ dueDate: { $exists: true } }` |
| `$contains` | StringSet contains value | `{ tags: { $contains: "tutorial" } }` |

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
  filter: { completed: false },             // optional: filter records before aggregating
  sort: { field: "count", direction: -1 },  // optional: sort results
  limit: 10,                                // optional: cap number of groups returned
});
// Returns: [{ category: "work", count: 8, avg_priority: 2.5, sum_estimatedHours: 40 }, ...]
```

### StringSet Facet Aggregation

When `groupBy` contains a `stringset` field, each string value becomes a separate group:

```typescript
// Count tasks per tag
const tagCounts = await Task.aggregate({
  groupBy: ["tags"],  // "tags" is a stringset field
  operations: [{ type: "count" }],
  sort: { field: "count", direction: -1 },
});
// Returns: { "work": 15, "urgent": 8, "personal": 5, ... }
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

Share a document by user ID, by email (grant resolves at signup if they aren't a member yet), or with an entire group:

```typescript
// By user ID
await client.documents.setPermissions(documentId, [
  { userId: "user-abc", permission: "read-write" },
]);

// By email — works whether or not the recipient is a member yet
await client.documents.setPermissions(documentId, [
  { email: "colleague@example.com", permission: "read-write" },
]);

// With a group
await client.documents.setGroupPermission(documentId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write",
});
```

The `primitive-app` library provides a `PrimitiveDocumentList` component with built-in sharing UI.

For the full sharing story — member invitations with quotas, email-based grants, access requests, and bookmarks — see [Sharing and Invitations](./sharing-and-invitations.md).

## Bookmarks

When a user creates a document, it's automatically added to their bookmarks. Invited users who accept an invitation also get an auto-bookmark. Bookmarks are how users curate their "home screen":

```typescript
const { items } = await client.me.bookmarks.list();
```

See [Sharing and Invitations](./sharing-and-invitations.md#bookmarks) for the full bookmarks API.

## Document Access Requests

A `403` from `client.documents.get(documentId)` can include a `canRequestAccess` hint. Users with a document link can submit a request, and document owners can approve or deny it. See [Sharing and Invitations](./sharing-and-invitations.md#document-access-requests).

## Next Steps

- **[Choosing Your Data Model](./choosing-your-data-model.md)** — When to use documents vs. databases
- **[Defining Your Models](./defining-your-models.md)** — TOML authoring, codegen, relationships, schema evolution
- **[Sharing and Invitations](./sharing-and-invitations.md)** — Full sharing, invitations, and access requests
- **[Working with Databases](./working-with-databases.md)** — Server-side structured storage
- **[Blobs and Files](./blobs-and-files.md)** — File storage within documents
