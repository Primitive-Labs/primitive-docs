# Working with Documents in the Primitive platform. (js-bao and js-bao-wss-client)

Guidelines for building apps with Primitive's document-based architecture.

## Core Concept: Documents

A **document** is:

1. A container for js-bao model objects
2. A sharing boundary—each document can be shared with different users at different permission levels
3. Can be used entirely interally, or exposed to app users as a concept that make sense for the application. For example a document might map to a Company in a business application, a Portfolio in a financial app, or a Channel in a communication app.

**Properties:**

- Documents are read/written locally. js-bao handles sync with the server.
- When other clients edit a document, local data updates in real-time.
- Access is all-or-nothing: users either have access to the entire document or none of it.

**Decision rule**: If data needs to be shared independently, it belongs in separate documents.

**Permission Levels:**

- **Reader** - View-only access
- **Read-write** - View and edit capabilities
- **Owner** - Full control including sharing and deletion

**Size Guidelines:** Documents work best around ~10MB each (soft limit). For most apps (thousands of records, years of data), this is sufficient.

## Documents vs. Databases

Primitive also provides **Databases** — server-side storage backed by Cloudflare Durable Objects. Documents are best for personal data, real-time collaboration, and offline access. Databases are best for app-wide shared data, large datasets, and fine-grained access control. Many apps use both.

See the [Data Modeling guide](AGENT_GUIDE_TO_PRIMITIVE_DATA_MODELING.md) for a full decision framework, comparison table, and example app architectures. See the [Databases guide](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md) for database API documentation.

## Critical Rules

1. **JS-Bao query operates over ALL open documents.** NEVER iterate over documents to query. Filter results by documentId or other fields in the query itself.

2. **Use model IDs, not document IDs.** Model data references entirely in objects using model IDs. Use documentIds ONLY when required for APIs (sharing, save location). In routes and queries, prefer model IDs.

3. **NEVER remove fields from models.** Add a deprecation comment instead.

4. **ALWAYS add new models to `models.toml`.** Run `pnpm models:gen` after adding or changing model definitions.

5. **Load data in pages, not sub-components.** Pass data into sub-components as props.

6. **Prefer `.query()` filtering over JavaScript filtering.** If filter params change based on app state, pass them via `queryParams` to the data loader.

7. **Understand the root document's role and limitations.** The root document is a special per-user document that is automatically created and opened. It can never be shared or deleted, and there is exactly one per user. The primitive template uses it to store user preferences via `userStore`—a great place for settings that should be available whenever the user signs in. While the root document can hold any js-bao model, we recommend storing most application data in regular documents for greater flexibility (sharing, collaboration, multiple documents). Use the "single document" pattern with aliases for personal apps, or the "one document at a time" pattern for multi-workspace apps.

## Document Lifecycle

### 1. Open Documents Before Querying

Documents must be opened before querying or modifying data within them.

```typescript
await jsBaoClient.documents.open(documentId);
const result = await MyModel.query({}, { documents: documentId });
```

Documents are ready to be queried once the `.open()` call finishes. Applications should wait for all required documents to be opened and show a loading state until all needed documents have been opened. Often it's handy to track this with an `isReady` ref.

**Wrong** — querying or saving before the document is open throws (or returns nothing for queries on no-document models):

```typescript
// DON'T: kick off open() and immediately query
jsBaoClient.documents.open(documentId);          // missing await
const result = await TodoItem.query({});         // throws DocumentClosedError on save,
                                                 // returns empty data for query
```

**Note on `jsBaoDocumentStore.isReady`:** The template app provides `jsBaoDocumentStore` with an `isReady` property. This indicates that the **store itself** has finished initializing — it does NOT indicate that any particular document has been opened. You still need to track document-specific readiness separately (e.g., after calling `documents.open()`) before querying data in those documents.

**Where in the Vue tree to open documents:**

- **Open in pages/layouts/stores, not sub-components.** Sub-components receive readiness and data as props.
- **Open after authentication, not before.** Gate on `userStore.isAuthenticated` (not `isInitialized`). The template's `AppLayout` already gates rendering on `isAuthenticated`, so components mounted inside it can call `open()` safely.
- **Session-scoped documents** (small bounded set, < ~20): open once at app/layout level for the session.
- **Route-scoped documents** (per-page, unbounded count, or transient): open on route entry, close on route leave. Render a loading state until `documents.open()` resolves and (with `useJsBaoDataLoader`) `initialDataLoaded` is true.
- **Handle open failures explicitly** — surface an error or redirect. Don't silently continue.
- **`open()` is idempotent** — calling it on an already-open document is a no-op.

### 2. Document List Access

```typescript
const documents = await jsBaoClient.documents.list(); // All documents (owned + shared)
const invitations = await jsBaoClient.me.pendingDocumentInvitations(); // Pending share invitations
```

**Pagination and filtering options:**

```typescript
// Filter by tag
const todoLists = await jsBaoClient.documents.list({ tag: "todolist" });

// Paginated results
const page = await jsBaoClient.documents.list({
  limit: 20,
  cursor: previousCursor,  // From previous page
  returnPage: true,        // Returns { items, cursor } instead of array
});
// page.items = DocumentInfo[], page.cursor = next page cursor

// Include root document (excluded by default)
const withRoot = await jsBaoClient.documents.list({ includeRoot: true });

// Check if a document has a local copy (synchronous)
const hasLocal = jsBaoClient.documents.hasLocalCopy(documentId);
```

## Common Document Usage Patterns

**Helper Stores:** This project includes `singleDocumentStore` and `multiDocumentStore` in `/src/stores/` that implement the patterns described below. These stores handle document opening, closing, readiness tracking, and state management. They can be used as-is, customized to fit your needs, or ignored in favor of application-specific approaches.

### Pattern 1: Single Document (Personal Apps)

**Best for:** Personal tools, single-user apps, no sharing needed

Each user gets exactly one document that holds all their data. The document is opened on app load / user sign-in. No document management UI is needed.

**Examples:** Personal task manager, habit tracker, journal app, budgeting tool

**User experience:** Users sign in and immediately see their data. No concept of "documents" is exposed in the UI.

**Implementation:**

```typescript
// On app initialization after user is authenticated
// Use getOrCreateWithAlias for idempotent initialization — no try/catch needed
const result = await jsBaoClient.documents.getOrCreateWithAlias({
  title: "My Data",
  alias: { scope: "user", aliasKey: "default-doc" },
});
// result.created === true if a new document was just created
await jsBaoClient.documents.open(result.documentId);
```

### Pattern 2: One Document at a Time (Workspaces)

**Best for:** Apps where users create discrete projects/workspaces they might share independently — accounting (per company), project management (per project), shared shopping lists (per household).

Users have multiple documents but work in one at a time, switching between them. Track a `currentDocument` ref and call `open()` on the chosen document.

**UI components** in `src/components/documents/`: `PrimitiveDocumentSwitcher` (sidebar dropdown) and `PrimitiveDocumentList` (full management page with rename/share/delete).

```typescript
// List, open, create
const documents = await jsBaoClient.documents.list();
await jsBaoClient.documents.open(selectedDocumentId);

const { metadata } = await jsBaoClient.documents.create({
  title: "New Project",
  tags: ["workspace"],
});
await jsBaoClient.documents.open(metadata.documentId);
```

### Pattern 3: Multiple Documents

**Best for:** Apps that query across many documents, each with its own sharing context — chat (per channel), multi-tenant dashboards, collaborative workspaces with distinct collections.

All documents that need live updates or cross-document queries must be open. Tag documents so you can fetch a set with `documents.list({ tag })`.

```typescript
// Open every document with a given tag
const channels = await jsBaoClient.documents.list({ tag: "channel" });
await Promise.all(
  channels.map((ch) => jsBaoClient.documents.open(ch.documentId))
);

// Query runs across all open documents by default
const messages = await Message.query({});
```

**Using multiDocumentStore:** For Pattern 3, the `multiDocumentStore` Pinia store provides a higher-level abstraction that handles:
- Registering collections by tag with automatic document opening (`autoOpen: true`)
- Tracking which documents belong to which collection
- Optional auto-acceptance of invitations (`autoAcceptInvites: true/false`)
- Proper document creation that ensures documents are opened and tracked

```typescript
// Register a collection (typically in a domain store's initialize function)
await multiDocStore.registerCollection({
  name: "todolists",
  tag: "todolist",
  autoOpen: true,        // Automatically open documents with this tag
  autoAcceptInvites: false, // Require manual invitation acceptance
});

// Create a document in the collection - ALWAYS use this, not documentsStore directly
const trackedDoc = await multiDocStore.createDocument(
  "todolists",  // collection name
  "My List",    // title
  { alias: { scope: "user", aliasKey: "default-list" } } // optional alias
);

// The document is automatically opened and tracked
// Now you can save models to it
const list = new TodoList();
list.title = "My List";
await list.save({ targetDocument: trackedDoc.documentId });
```

**Collection and document readiness:**

- `multiDocStore.isCollectionReady('todolists')` returns a `ComputedRef<boolean>` that is `true` once the collection has finished opening all its documents. Pass this directly as `documentReady` to `useJsBaoDataLoader`:

```typescript
const { data, initialDataLoaded } = useJsBaoDataLoader({
  subscribeTo: [TodoItem],
  queryParams: ...,
  documentReady: multiDocStore.isCollectionReady('todolists'), // ComputedRef<boolean>
  async loadData(queryParams) { ... },
});
```

- `multiDocStore.isDocumentReady(selectedDocIdRef)` returns a `ComputedRef<boolean>` that is `true` when a specific document is open. The argument must be a `Ref<string>` or `ComputedRef<string>` (not a plain string), so that readiness updates reactively when the selected document changes:

```typescript
const selectedDocId = ref('doc-abc123');
const { data, initialDataLoaded } = useJsBaoDataLoader({
  subscribeTo: [TodoItem],
  queryParams: ...,
  documentReady: multiDocStore.isDocumentReady(selectedDocId), // ComputedRef<boolean>
  async loadData(queryParams) { ... },
});
```

Always pass the `ComputedRef` directly — never call `.value` on it when passing to `useJsBaoDataLoader`.

**Critical:** When working with multiDocumentStore collections, ALWAYS use `multiDocStore.createDocument()` to create new documents. Using `documentsStore.createDocumentWithAlias()` or other low-level methods bypasses the collection's auto-open and tracking logic, causing documents to not appear in reactive lists.

## Data Modeling Decisions

### Separate Documents When:

- Items need independent sharing (e.g., each todo list shared with different people)
- Items are logically distinct workspaces/projects
- You want to limit sync scope

### Single Document When:

- All data should always be shared together
- Data is tightly coupled
- Simplicity is more important than granular sharing

### Tagging Documents

Use tags to categorize documents by type:

```typescript
const { metadata } = await jsBaoClient.documents.create({
  title: "My List",
  tags: ["todolist"],
});

// Filter documents by tag using list options
const todoLists = await jsBaoClient.documents.list({ tag: "todolist" });

// Or filter locally
const documents = await jsBaoClient.documents.list();
const todoLists = documents.filter((doc) => doc.tags?.includes("todolist"));
```

**Programmatic tag management:**

```typescript
// Add a tag to an existing document
await jsBaoClient.documents.addTag(documentId, "archived");

// Remove a tag from a document
await jsBaoClient.documents.removeTag(documentId, "archived");
```

## Defining Models

### Creating New Model Files

Models are defined in `src/models/models.toml` and generated into TypeScript by running `pnpm models:gen`. Generated files are pure data containers — business logic belongs in a controller module in `src/lib/`.

**Step 1: Add your model to `src/models/models.toml`**

Use snake_case keys (`auto_assign`, `max_length`, `max_count`); the loader maps them to camelCase at runtime:

```toml
[models.todos.fields.id]
type = "id"
auto_assign = true
indexed = true

[models.todos.fields.title]
type = "string"
indexed = true

[models.todos.fields.completed]
type = "boolean"
default = false
```

**Step 2: Run `pnpm models:gen`** to regenerate `Todo.generated.ts` (attribute interface + empty class) and update the `index.ts` barrel that registers all models. Do not edit generated files.

**Step 3: Import from `@/models`** — not from `.generated` files directly. The barrel registers all models as a side effect on first import:

```typescript
import { Todo } from "@/models";
```

**Step 4: Add business logic to a controller in `src/lib/`** as free functions. Keep the model class as a pure data container with no instance methods:

```typescript
// src/lib/todoController.ts
import type { Todo } from "@/models";

export function isComplete(todo: Todo): boolean {
  return todo.completed === true;
}

export function pendingCount(todos: Todo[]): number {
  return todos.filter((t) => !t.completed).length;
}
```

Call sites use `isComplete(todo)` rather than `todo.isComplete()`. This pattern keeps models as plain data objects and makes business logic easy to test without Vue dependencies.

**CRITICAL: NEVER edit `.generated.ts` files or the generated `index.ts`** — they are overwritten on every `pnpm models:gen` run.

**Wrong** — manually attaching a schema skips the registry hook that wires up field accessors and unique-constraint indexes:

```typescript
// DON'T DO THIS — model never gets registered with ModelRegistry,
// queries/saves will throw "Model not properly initialized".
export class Todo extends BaseModelImpl {
  static schema = todoSchema;
}
```

### Field Types

| Type        | Description                  | Common TOML Options                  |
| ----------- | ---------------------------- | ------------------------------------ |
| `id`        | Unique identifier            | `auto_assign = true`                 |
| `string`    | Text values                  | `indexed = true`, `default = ""`     |
| `number`    | Numeric values               | `indexed = true`, `default = 0`      |
| `boolean`   | True/false                   | `default = false`                    |
| `date`      | ISO-8601 strings             | `indexed = true`                     |
| `stringset` | Collection of strings (tags) | `max_count = 20`                     |

### Field Options

```toml
[models.tasks.fields.id]
type = "id"
auto_assign = true
indexed = true

[models.tasks.fields.title]
type = "string"
indexed = true

[models.tasks.fields.priority]
type = "number"
default = 0

[models.tasks.fields.dueDate]
type = "date"

[models.tasks.fields.tags]
type = "stringset"
max_count = 10

[models.tasks.fields.archived]
type = "boolean"
default = false
```

### Unique Constraints

```toml
# Single-field uniqueness — enables `upsertOn` on save.
[models.users.fields.email]
type = "string"
unique = true
indexed = true
```

Single-field constraints declared with `unique = true` get an auto-generated constraint name of `<modelName>_<fieldName>_unique` (e.g. `users_email_unique`). Pass this name to `upsertByUnique` or `upsertOn`.

### Working with StringSets

```typescript
// Add/remove tags
task.tags.add("urgent");
task.tags.remove("low-priority");

// Check membership
if (task.tags.has("urgent")) { ... }

// Convert to array for display
const tagList = task.tags.toArray();
```

### Working with Dates

Dates are stored as ISO-8601 strings. Convert for comparisons:

```typescript
// Store
task.dueDate = new Date().toISOString();

// Compare
const due = new Date(task.dueDate);
if (due < new Date()) {
  console.log("Overdue!");
}

// Query with date comparison
const result = await Task.query({
  dueDate: { $lt: new Date().toISOString() },
});
```

## Querying Data

`Model.query()` returns a `PaginatedResult`: `{ data: T[], nextCursor?, prevCursor?, hasMore }`. ALWAYS access rows through `.data`.

```typescript
// Query a specific document
const result = await TodoItem.query(
  { completed: false },
  { documents: documentId, sort: { order: 1 } }
);
const items = result.data;             // T[]
const more = result.hasMore;           // boolean

// Query across all open documents (default)
const all = await TodoItem.query({ completed: false });

// Single result helper — returns T | null
const item = await TodoItem.queryOne({ id: someId });
```

**Wrong** — `.query()` does NOT return an array directly:

```typescript
// DON'T:
const items = await TodoItem.query({ completed: false }); // items is { data, nextCursor, ... }
items.map(...);  // TypeError: items.map is not a function
```

### Query Operators

| Operator        | Description                    | Example                                              |
| --------------- | ------------------------------ | ---------------------------------------------------- |
| `$eq`           | Equals (default)               | `{ status: "active" }`                               |
| `$ne`           | Not equals                     | `{ status: { $ne: "deleted" } }`                     |
| `$gt`, `$lt`    | Greater/less than              | `{ priority: { $gt: 5 } }`                           |
| `$gte`, `$lte`  | Greater/less or equal          | `{ dueDate: { $lte: today } }`                       |
| `$in`           | Matches any in array           | `{ status: { $in: ["active", "pending"] } }`         |
| `$nin`          | Not in array                   | `{ status: { $nin: ["deleted", "archived"] } }`      |
| `$startsWith`   | String prefix match            | `{ title: { $startsWith: "Bug:" } }`                 |
| `$endsWith`     | String suffix match            | `{ filename: { $endsWith: ".md" } }`                 |
| `$containsText` | Case-insensitive contains      | `{ title: { $containsText: "urgent" } }`             |
| `$exists`       | Field exists/not null          | `{ dueDate: { $exists: true } }`                     |
| `$contains`     | StringSet contains value       | `{ tags: { $contains: "tutorial" } }`                |
| `$all`          | StringSet contains all values  | `{ tags: { $all: ["work", "urgent"] } }`             |
| `$size`         | StringSet size comparison      | `{ tags: { $size: { $gte: 2 } } }`                   |

**Logical operators:**

```typescript
const result = await Task.query({
  $or: [
    { priority: 3 },
    { dueDate: { $lt: new Date().toISOString() } },
  ],
});
```

```typescript
const result = await Task.query({
  completed: false,
  priority: { $gte: 3 },
  tags: { $in: ["work", "urgent"] },
});
```

### Pagination

Use cursor-based pagination for large result sets:

```typescript
const pageSize = 20;
let cursor: string | undefined;

// First page
const page1 = await Task.query(
  { completed: false },
  { limit: pageSize, sort: { createdAt: -1 } }
);

// Next page using cursor
cursor = page1.nextCursor;
const page2 = await Task.query(
  { completed: false },
  { limit: pageSize, sort: { createdAt: -1 }, uniqueStartKey: cursor }
);
```

### Counting Records

```typescript
const activeCount = await Task.count({ completed: false });
const totalCount = await Task.count({});
```

### Loading Related Data (Includes)

Use `include` in query options to load related records alongside results. Related records are attached under `._related` on each result row (rows live on `.data`).

**Include types:**

| Type | Relationship | FK location | Required spec field |
|------|-------------|-------------|--------------------|
| `refersTo` | One related record | FK field on source model | `sourceField` |
| `hasMany` | Multiple related records | FK field on target model pointing back | `foreignKey` |
| `refersToMany` | Multiple related records | StringSet field on source model holding target IDs | `sourceField` |

```typescript
// refersTo: Post has an authorId pointing to a User
const result = await Post.query({}, {
  include: [{
    model: "users",
    type: "refersTo",
    sourceField: "authorId",  // FK field on Post
    as: "author",             // key in _related (defaults to model name)
    projection: { name: 1 },  // optional field subset
  }],
});
// result.data[0]._related.author = { id, name }

// hasMany: Comment has a postId field pointing back to Post
const result = await Post.query({}, {
  include: [{
    model: "comments",
    type: "hasMany",
    foreignKey: "postId",    // FK on Comment pointing to Post
    localField: "id",        // field on Post to match against (defaults to "id")
    as: "comments",
    sort: { createdAt: -1 },
    limit: 10,               // per-parent cap
    filter: { status: "approved" },
  }],
});
// result.data[0]._related.comments = [{ id, text, ... }]

// refersToMany: Post has a tagIds StringSet field containing Tag IDs
const result = await Post.query({}, {
  include: [{
    model: "tags",
    type: "refersToMany",
    sourceField: "tagIds",   // StringSet field on Post
    as: "tags",
  }],
});
// result.data[0]._related.tags = [{ id, name }, ...]
```

Includes can be nested (up to 3 levels deep) by adding an `include` array to an include spec:

```typescript
const result = await Article.query({}, {
  include: [{
    model: "comments",
    type: "hasMany",
    foreignKey: "articleId",
    as: "comments",
    include: [{
      model: "users",
      type: "refersTo",
      sourceField: "authorId",
      as: "author",
      projection: { name: 1 },
    }],
  }],
});
// result.data[0]._related.comments[0]._related.author = { id, name }
```

### Aggregations

Group and calculate statistics. Returns a **nested object keyed by group values** (not an array):

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
// Returns:
// {
//   work:     { count: 8, avg_priority: 2.5, sum_estimatedHours: 40 },
//   personal: { count: 3, avg_priority: 1.0, sum_estimatedHours:  6 },
// }
```

Multi-field `groupBy` produces deeper nesting (`result[group1][group2] = { ...ops }`). Operation result keys are `count`, `sum_<field>`, `avg_<field>`, `min_<field>`, `max_<field>`.

**StringSet facet aggregation** — grouping by a `stringset` field counts per value. When the only operation is `count`, the value collapses to a number:

```typescript
const tagCounts = await Task.aggregate({
  groupBy: ["tags"],  // "tags" is a stringset field
  operations: [{ type: "count" }],
});
// Returns: { "work": 15, "urgent": 8, "personal": 5, ... }
```

Only one stringset facet field is allowed per aggregation. To check membership of a specific value across records, use a `StringSetMembership` groupBy entry: `{ field: "tags", contains: "urgent" }`.

### useJsBaoDataLoader Pattern

`useJsBaoDataLoader` is a composable provided by the primitive library that centralizes data loading for a component. It handles four key concerns:

1. **Waiting for documents to be ready** - The `documentReady` ref/computed tells the loader when all required documents have been opened. Queries won't run until `documentReady` is true, preventing errors from querying before documents are available.

2. **Knowing when UI is ready to render** - The `initialDataLoaded` ref becomes true after the first successful data load, letting you show loading states appropriately.

3. **Subscribing to model changes** - When any model in `subscribeTo` changes (local edits or sync from other clients), the loader automatically re-runs `loadData` to keep the UI current.

4. **Reactive query parameters** - When `queryParams` change (route params, filters, pagination, etc.), the loader re-runs `loadData` with the new parameters. Route params are not automatically included in `queryParams` so you should include them if changes to route params should trigger reloading data.

**Data flow pattern:** Update `queryParams` based on page state, UI filters, or pagination → triggers `loadData` → returns data → reactive UI update. This keeps data loading centralized and predictable.

**Best practices:**

- Centralize all data loading for a component in a single `useJsBaoDataLoader` call
- Push filtering logic into js-bao `.query()` calls rather than fetching everything and filtering in JavaScript
- Always pass `documentReady` - typically a ref that becomes true after your document opening logic completes

```typescript
const {
  data: todos,
  initialDataLoaded,
  reload,
} = useJsBaoDataLoader<{ items: TodoItem[]; total: number }>({
  subscribeTo: [TodoItem],
  queryParams: computed(() => ({ listId: props.listId, showCompleted })),
  documentReady,
  async loadData(queryParams) {
    const { listId, showCompleted } = queryParams ?? {};
    const query = showCompleted ? { listId } : { listId, completed: false };
    const result = await TodoItem.query(query, { sort: { order: 1 } });
    return { items: result.data, total: result.data.length };
  },
});
```

**Rules:**

- Use `useJsBaoDataLoader` no more than once per component
- **Return a single structured object** from `loadData`
- NEVER add a watch on `loadData` results. Do processing inside `loadData`.
- NEVER rely on component remounting for route param changes. The loader only sees changes via `queryParams`.
- `initialDataLoaded` becomes true after the first successful `loadData`. Use this (not `documentReady`) with `PrimitiveLoadingGate`.
- Make rendering/redirect decisions ONLY after `initialDataLoaded` is true.
- For side effects after load (like redirects), watch `initialDataLoaded` and act when it becomes true.
- For sequences of mutations (save/delete/reorder), set `pauseUpdates` while mutating, then call `reload()` afterward to avoid flicker.

## Saving Data

### Save to a Specific Document (when creating new objects)

```typescript
const newItem = new TodoItem();
newItem.title = "Buy groceries";
await newItem.save({ targetDocument: documentId });
```

### Update Existing Item

```typescript
// Items remember their document
todo.completed = true;
await todo.save();
```

**Wrong** — common save footguns:

```typescript
// DON'T: forget to await — the next read may not see the change yet,
// and unhandled rejections (e.g. document closed) get swallowed.
todo.completed = true;
todo.save();              // missing await
router.push("/done");

// DON'T: try to spread/clone a model object — instances are not POJOs.
const copy = { ...todo }; // loses reactivity, getters, save method
const copy2 = JSON.parse(JSON.stringify(todo)); // also broken

// DO: read fields directly, or call .toJSON() if defined.
const snapshot = { id: todo.id, title: todo.title, completed: todo.completed };
```

### Choosing How to Target Documents for Saves

When saving new objects, you need to specify which document they go into. There are three ways to do this:

1. **Pass `targetDocument` explicitly on each save** (preferred for most cases):
   ```typescript
   await item.save({ targetDocument: documentId });
   ```

2. **`jsBaoClient.setDefaultDocumentId(docId)`** — sets a default document for all subsequent saves that don't specify a `targetDocument`. Good when many consecutive saves go to the same document (e.g., during app initialization or a bulk import).

3. **`jsBaoClient.addDocumentModelMapping(modelName, docId)`** — routes all saves of a specific model to a specific document. Good when a model *always* goes to the same document for the lifetime of the app session.

**Anti-pattern: Frequently switching defaults.** If your app writes to different documents based on context (e.g., the user switches between workspaces, or items are routed to different documents based on their properties), do NOT repeatedly call `setDefaultDocumentId()` or update model-document mappings to redirect writes. This is fragile and error-prone — it creates implicit state that's easy to get out of sync. Instead, pass `targetDocument` explicitly on each `.save()` call. Reserve `setDefaultDocumentId` and `addDocumentModelMapping` for cases where the target doesn't change, or changes only rarely.

### Deleting Records

```typescript
const task = await Task.find("task-id");
if (task) {
  await task.delete();
}
```

### Upsert by Unique Constraint

`upsertByUnique(constraintName, lookupValue(s), data, options?)` — finds an existing record by a named constraint and updates it, or creates one if none exists. The `data` object MUST include the same constraint field values as `lookupValue` (mismatch throws). When creating a new record, `targetDocument` is REQUIRED.

```typescript
// Composite-key example — uses the constraint name from defineModelSchema above.
await Category.upsertByUnique(
  "name_parent_unique",                    // constraint name
  ["Work", null],                          // values in field order
  { name: "Work", parentId: null, color: "blue" },
  { targetDocument: documentId }           // required if a new record is created
);

// Single-field example — value can be a scalar instead of an array.
// Auto-generated constraint name uses the schema `name`, not the class name.
await User.upsertByUnique(
  "users_email_unique",                    // <schemaName>_<fieldName>_unique
  "alice@example.com",
  { email: "alice@example.com", name: "Alice" },
  { targetDocument: documentId }
);
```

Single-field constraints declared via `unique: true` get an auto-generated name of `<schemaName>_<fieldName>_unique` (where `schemaName` is the `name` you passed to `defineModelSchema`). Use `options.uniqueConstraints` to control the name.

For single-field upserts where the value already lives on the instance, `save({ upsertOn })` is simpler than `upsertByUnique` — see next section.

**Wrong** — common mistakes that throw at runtime:

```typescript
// DON'T: pass field names instead of the constraint name
await Category.upsertByUnique(["name", "parentId"], ...); // throws: constraint not found

// DON'T: omit targetDocument when creating
await Category.upsertByUnique("name_parent_unique", ["Work", null], { name: "Work", parentId: null });
// throws: targetDocument is required when creating new records

// DON'T: data values that don't match lookupValue
await Category.upsertByUnique("name_parent_unique", ["Work", null], { name: "Home", parentId: null }, { targetDocument });
// throws: Mismatch between dataToUpsert.'name' and uniqueLookupValue
```

### Upsert by Natural Key (`upsertOn`)

Use the `upsertOn` option in `save()` to upsert by a natural unique field (e.g., `email`, `slug`) without knowing the existing record's ID. The field must have a single-field `uniqueConstraints` entry on the model.

```typescript
const user = new User({ email: "alice@example.com", name: "Alice", role: "admin" });
// Creates a new record if none exists with that email, or merges into the existing one
const result = await user.save({ upsertOn: "email" });
```

Behavior:
- **No existing record**: creates a new record with an auto-generated ID (or the caller-provided ID)
- **Existing record found**: merges the provided fields into the existing record; unprovided fields are preserved; returns the existing record's ID
- **Caller provides an ID that mismatches the found record**: throws an error (conflict)

`upsertOn` validates that the field has a registered unique index. It throws if the field is missing from the data or has a null/empty value.

### Save Merge Semantics

`save()` uses **merge semantics**: only the fields you set on the instance are written; existing fields not included in the change set are preserved. Setting a field to `null` removes it from the stored record.

This applies both to new saves and updates, and is consistent across single saves and batch operations.

## Design Patterns

### Singleton Model per Document (Avoiding ID Confusion)

Create a singleton model per document for metadata. Child models reference by model ID, not document ID:

```toml
# TodoList - one per document
[models.todo_lists.fields.id]
type = "id"
auto_assign = true
indexed = true

[models.todo_lists.fields.title]
type = "string"

[models.todo_lists.fields.createdAt]
type = "number"

[models.todo_lists.fields.createdBy]
type = "string"

# TodoItem references TodoList by MODEL ID (not document ID)
[models.todo_items.fields.id]
type = "id"
auto_assign = true
indexed = true

[models.todo_items.fields.listId]
type = "string"
indexed = true

[models.todo_items.fields.title]
type = "string"

[models.todo_items.fields.completed]
type = "boolean"
default = false
```

**Use this pattern when:**

- Documents represent a meaningful entity (project, list, workspace)
- You need document-level metadata
- Child models need to reference their parent container

### Singleton Documents with Aliases

For documents that should exist exactly once (default document, settings), use `getOrCreateWithAlias`. This single call atomically resolves an existing alias or creates a new document with that alias, eliminating race conditions when multiple clients initialize simultaneously.

```typescript
// Atomic get-or-create — handles everything in one call
const result = await jsBaoClient.documents.getOrCreateWithAlias({
  title: "My Preferences",
  alias: { scope: "user", aliasKey: "user-preferences" },
});
// result.created === true if a new document was just created
await jsBaoClient.documents.open(result.documentId);
```

**Alias scopes:**

- `"user"` - Unique per user (each user can have their own document with this alias)
- `"app"` - Unique across entire app (shared by all users)

**Alias API methods:**

- `documents.openAlias(params)` - Open document by alias (throws if not found)
- `documents.createWithAlias(options)` - Create document with alias atomically (fails if alias already exists)
- `documents.getOrCreateWithAlias(options)` - Get existing document by alias, or create a new one if not found. Returns `{ documentId, created: boolean, ... }`. Use this for idempotent initialization.
- `documents.aliases.resolve(params)` - Get alias info (returns null if not found)
- `documents.aliases.set(params)` - Set an alias for an existing document
- `documents.aliases.delete(params)` - Remove an alias
- `documents.aliases.listForDocument(documentId)` - List all aliases for a document

## Sharing Documents

Documents can be shared with individual users (by userId or email), with groups, or exposed to a request-access flow for users with a link. For the full picture — member invitations with quotas, deferred grants, access requests, and bookmarks — see the [Sharing and Invitations guide](AGENT_GUIDE_TO_PRIMITIVE_SHARING_AND_INVITATIONS.md).

### Quick Reference

```typescript
// By userId — single user
await client.documents.updatePermissions(documentId, {
  userId: "user-abc",
  permission: "read-write",
});

// Batch — multiple users at once
await client.documents.updatePermissions(documentId, {
  permissions: [
    { userId: "user-abc", permission: "read-write" },
    { userId: "user-xyz", permission: "reader" },
  ],
});

// By email — resolves if the user exists, otherwise creates a deferred grant
// that auto-applies at signup. Use createInvitation (not updatePermissions) for
// the email path.
await client.documents.createInvitation(
  documentId,
  "alice@example.com",
  "read-write",
  { sendEmail: true, documentUrl: `${window.location.origin}/lists` }
);

// With a group
await client.documents.grantGroupPermission(documentId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write",
});

// Respond to a 403 with canRequestAccess hint. `permission` is REQUIRED.
try {
  await client.documents.open(documentId);
} catch (err) {
  if (err.details?.canRequestAccess) {
    await client.documents.requestAccess(documentId, {
      permission: "read-write",
      message: "Please grant me access",
    });
  }
}
```

**Wrong** — these names look reasonable but do not exist on the API:

```typescript
// DON'T:
await client.documents.setPermissions(...);      // use updatePermissions
await client.documents.setGroupPermission(...);  // use grantGroupPermission
await client.documents.requestAccess(id, { message: "..." }); // missing required `permission`
```

Documents are auto-bookmarked for their creator and for any invitee who accepts an invitation. Use `client.me.sharedDocuments()` to render a "shared with me" view — do not filter bookmarks for this purpose.

### Using PrimitiveShareDocumentDialog

When allowing users to share documents, use `PrimitiveShareDocumentDialog`:

```vue
<PrimitiveShareDocumentDialog
  :is-open="showShareDialog"
  :document-id="currentDocumentId"
  :document-label="currentList?.title ?? 'Document'"
  :invite-url-template="`${window.location.origin}/lists`"
  @close="showShareDialog = false"
/>
```

**Critical:** The `invite-url-template` prop is REQUIRED when users send email notifications. Without it, the API returns HTTP 400. The URL should point to a page where invited users can see and accept their invitations.

### Handling Invitations

**Auto-accept vs Manual:**
- `autoAcceptInvites: true` - Invitations are automatically accepted when the document tag matches a registered collection. Documents appear immediately in the user's list.
- `autoAcceptInvites: false` - Users must manually accept invitations on a management page. Provides more control but requires UI for viewing/accepting invitations.

**Navigating after accepting an invitation:**

When a user accepts an invitation, you typically want to navigate them to the content. Since routes use model IDs (not document IDs), query for the model first:

```typescript
async function handleInvitationAccepted(documentId: string): Promise<void> {
  // Brief delay for document to sync after acceptance
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Query for the model in the newly accessible document
  const result = await TodoList.query({}, { documents: documentId });
  const list = result.data[0];
  if (list) {
    router.push({ name: "todo-list", params: { listId: list.id } });
  }
}
```

### Closing Documents

When your app opens many documents over a session (e.g., viewing individual items that each live in their own document), close documents you're no longer using to avoid accumulating sync connections:

```typescript
// Close a document and stop syncing
await jsBaoClient.documents.close(documentId);

// Close and remove the local cached copy
// Safe: eviction is skipped if the server doesn't yet have all local writes
const { evicted } = await jsBaoClient.documents.close(documentId, { evictLocal: true });
if (!evicted) {
  // Server was not fully in sync — local copy was retained
}
```

When `evictLocal: true` is passed, the client performs a state vector check against the server before removing local data. If the server hasn't received all local writes (e.g. due to a brief network interruption), eviction is skipped and `evicted: false` is returned. This prevents data loss during WebSocket instability.

### Sync Verification

Use these methods to confirm the server has received your writes before taking irreversible actions (e.g., logging out, clearing local storage):

```typescript
// Check if the server has received all of this client's writes
const hasAllWrites = await jsBaoClient.documents.includesWrites(documentId);

// Check if client and server have completely identical document state
const fullyInSync = await jsBaoClient.documents.inSync(documentId);
```

Both return `false` if the client is disconnected or the check times out. An optional `timeoutMs` parameter controls how long to wait (default: 5000ms).

For cases where you need to wait until the server is confirmed to have all writes, use the polling helpers — they exist on both `documents.*` and the client root:

```typescript
// Wait until server has all writes (returns true on success, false on timeout)
await jsBaoClient.documents.waitForWriteConfirmation(documentId);

// Wait until fully in sync (throws on timeout)
await jsBaoClient.documents.waitForInSync(documentId);
```

### Updating Document Metadata

```typescript
// Update a document's title
await jsBaoClient.documents.update(documentId, { title: "New Title" });

// Check if a document is currently open
const open = jsBaoClient.documents.isOpen(documentId);
```

### Deleting Documents

```typescript
// Delete a document (must be closed first)
await jsBaoClient.documents.delete(documentId);

// Force-close before deleting
await jsBaoClient.documents.delete(documentId, { forceCloseIfOpen: true });
```

Note: Root documents cannot be deleted.

### Programmatic Sharing — Full Reference

Beyond the Quick Reference and the `PrimitiveShareDocumentDialog` UI, the full programmatic surface:

```typescript
// Inspect access
await jsBaoClient.documents.getPermissions(documentId);
// → [{ userId, email, name, permission, grantedAt }, ...]
await jsBaoClient.documents.listGroupPermissions(documentId);
await jsBaoClient.documents.listPendingInvitations(documentId);

// Mutate access
await jsBaoClient.documents.updatePermissions(documentId, {
  userId, permission: "read-write",
});
await jsBaoClient.documents.updatePermissions(documentId, {
  permissions: [{ userId, permission: "reader" }, ...],
});
await jsBaoClient.documents.removePermission(documentId, userId);
// Cancel a pending email invitation:
await jsBaoClient.documents.removePermission(documentId, { email });
await jsBaoClient.documents.transferOwnership(documentId, newOwnerId);

await jsBaoClient.documents.grantGroupPermission(documentId, {
  groupType, groupId, permission: "read-write",
});
await jsBaoClient.documents.revokeGroupPermission(documentId, groupType, groupId);

// Email invitations — `documentUrl` is REQUIRED when sendEmail is true
await jsBaoClient.documents.createInvitation(
  documentId, "user@example.com", "read-write",
  { sendEmail: true, documentUrl: `${origin}/lists`, note: "..." }
);
await jsBaoClient.documents.acceptInvitation(documentId);
await jsBaoClient.documents.declineInvitation(documentId, invitationId);

// Access requests (when caller has no access yet)
await jsBaoClient.documents.requestAccess(documentId, {
  permission: "read-write", message, documentUrl, reviewUrl,
});
await jsBaoClient.documents.listAccessRequests(documentId);     // owners only
await jsBaoClient.documents.approveAccessRequest(documentId, requestId);
```

### Collections

Group documents into a **collection** to share them as a unit. Permissions granted on a collection materialize onto all current and future documents in it.

**Key properties:**
- Permissions are **additive, max-wins** — a collection can only add access, never restrict it.
- A document can be in multiple collections; access from all sources combines.
- Deleting a collection revokes its permissions but never deletes the documents or any direct grants.
- Member access is O(1) regardless of collection size (uses system-managed groups internally).

```typescript
// Create
const collection = await client.collections.create({
  name: "Q1 Reports",
  description: "All quarterly report documents",
  // Optional, immutable-after-create — bind to a CollectionTypeConfig rule set
  // and an external entity (exposed to CEL as collection.contextId).
  collectionType: "class-reports",
  contextId: "math-101",
});

// Add / remove documents
await client.collections.addDocument(collection.collectionId, documentId);
await client.collections.removeDocument(collection.collectionId, documentId);

// List
await client.collections.listDocuments(collection.collectionId);
// → { items: CollectionDocumentInfo[], cursor?: string }
await client.collections.listCollectionsForDocument(documentId);

// Share with a group (fans out to every document in the collection)
await client.collections.grantGroupPermission(collection.collectionId, {
  groupType: "team", groupId: "engineering", permission: "read-write",
});
await client.collections.revokeGroupPermission(collection.collectionId, "team", "engineering");

// Share with individual users (O(1))
await client.collections.addMember(collection.collectionId, {
  userId: targetUserId, permission: "reader",
});
await client.collections.removeMember(collection.collectionId, targetUserId);
// Change a user's permission: call addMember again with the new level.

// Inspect all access
const access = await client.collections.getAccess(collection.collectionId);
// → { groups: [...], members: [...] }
```

For per-context CEL rules using `collectionType` + `contextId`, see the [Users and Groups guide](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md).

**CLI:**

```bash
primitive collections create "Q1 Reports" --description "Quarterly reports"
primitive collections list
primitive collections docs {add|remove|list} <collection-id> [<document-id>]
primitive collections share <collection-id> --group team/engineering --permission read-write
primitive collections members {add|remove} <collection-id> <user-id> [--permission reader]
primitive collections access <collection-id>
```

### Read-Only Permission Handling

When a user has "reader" permission, disable all edit functionality:

```typescript
const isReadOnly = computed(() => {
  if (!currentDocumentId.value) return true;
  const doc = todoStore.todoListDocuments.find(
    (d) => d.documentId === currentDocumentId.value
  );
  return doc?.permission === "reader";
});
```

Pass `isReadOnly` to child components and use it to:
- Hide create/add buttons (`v-if="!isReadOnly"`)
- Hide delete buttons and drag handles
- Disable checkboxes and inputs (`:disabled="isReadOnly"`)
- Hide share buttons (only owners can share)
- Prevent inline editing

## Admin CLI: Export / Import

The `primitive` CLI provides export and import commands for migrating or backing up document data. These are admin operations, not used in application code.

```bash
# Export a single document (Yjs state, blobs, permissions, aliases)
primitive documents export <document-id> --output ./primitive-export

# Export all documents for a user
primitive documents export-all --user-id <user-id> --output ./primitive-export
primitive documents export-all --user-id <user-id> --owned-only  # Only owned documents

# Import from an export directory
primitive documents import <path>                         # Default: skip existing aliases
primitive documents import <path> --aliases overwrite     # Overwrite existing user-scoped aliases
primitive documents import <path> --aliases skip          # Keep existing aliases (default)
primitive documents import <path> --overwrite --dry-run   # Preview without changes
```

Export creates a directory per document containing `metadata.json`, `document.yjs` (Yjs state), `permissions.json` (for reference), and `blobs/` (attachments). Permissions are **not** restored on import — the importing admin becomes the new owner and manages sharing in the target app. Document IDs are preserved across import. User-scoped aliases can be restored with `--aliases overwrite` or kept as-is with `--aliases skip`.

## Common Errors

| Symptom                                         | Cause                                                                    | Fix                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Need document from item                         | N/A                                                                      | Use `item.getDocumentId()`                                                                           |
| Data doesn't update when route param changes    | Vue reuses components; `useJsBaoDataLoader` doesn't see the change       | Add the route param to `queryParams` in the data loader, OR use `:key="routeParam"` on the component |
| Spread object missing data or reactivity broken | js-bao model objects don't support JavaScript spreading (`{ ...model }`) | Access properties directly or use explicit property copying: `{ id: model.id, title: model.title }`  |
| Query `field: false` misses items               | Items with `field: undefined` don't match `field: false`                 | Use a default value in schema, OR filter in JavaScript with `item.field ?? false`                    |
| Document created but not in sidebar/list        | Used `documentsStore` directly instead of `multiDocStore`                | Always use `multiDocStore.createDocument()` when working with collections                            |
| HTTP 400 when sharing with email                | Missing `documentUrl` in invitation                                       | Pass `invite-url-template` prop to `PrimitiveShareDocumentDialog`                                    |
| New document not queryable immediately          | Document not opened after creation                                        | Use `multiDocStore.createDocument()` which handles opening automatically                             |
| `setPermissions is not a function`              | Method doesn't exist                                                      | Use `updatePermissions(documentId, { userId, permission })`                                          |
| `setGroupPermission is not a function`          | Method doesn't exist                                                      | Use `grantGroupPermission(documentId, { groupType, groupId, permission })`                           |
| "Model not properly initialized" on save/query  | Schema attached manually instead of via `attachAndRegisterModel`          | Re-run `pnpm models:gen`; never set `static schema = ...` by hand                                    |
| `upsertByUnique`: "constraint not found"        | Passed field array instead of constraint name                             | Pass the named constraint string (e.g. `"users_email_unique"`)                                       |
| `upsertByUnique`: "targetDocument is required"  | Creating a new record without specifying its document                     | Pass `{ targetDocument: docId }` as the 4th argument                                                 |
| `query()` result missing `.map`/`.filter`       | Forgot result is a `PaginatedResult`                                      | Use `result.data` (also has `.nextCursor`, `.hasMore`)                                               |
