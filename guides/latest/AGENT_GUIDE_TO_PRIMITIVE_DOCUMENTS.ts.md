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

Primitive also provides **Databases** — isolated, server-side storage. Documents are best for personal data, real-time collaboration, and offline access. Databases are best for app-wide shared data, large datasets, and fine-grained access control. Many apps use both.

See the [Data Modeling guide](AGENT_GUIDE_TO_PRIMITIVE_DATA_MODELING.md) for a full decision framework, comparison table, and example app architectures. See the [Databases guide](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md) for database API documentation.

## Critical Rules

1. **JS-Bao query operates over ALL open documents.** NEVER iterate over documents to query. Filter results by documentId or other fields in the query itself.

2. **Use model IDs, not document IDs.** Model data references entirely in objects using model IDs. Use documentIds ONLY when required for APIs (sharing, save location). In routes and queries, prefer model IDs.

3. **NEVER remove fields from models.** Add a deprecation comment instead.

4. **ALWAYS add new models to `models.toml`.** Run `npx js-bao-codegen-v2` after editing `models.toml`.

5. **Load data in pages, not sub-components.** Pass data into sub-components as props.

6. **Prefer `.query()` filtering over JavaScript filtering.** If filter params change based on app state, pass them via `queryParams` to the data loader.

7. **Understand the root document's role and limitations.** The root document is a special per-user document that is automatically created and opened. It can never be shared or deleted, and there is exactly one per user. The primitive template uses it to store user preferences via `userStore`—a great place for settings that should be available whenever the user signs in. While the root document can hold any js-bao model, we recommend storing most application data in regular documents for greater flexibility (sharing, collaboration, multiple documents). Use the "single document" pattern with aliases for personal apps, or the "one document at a time" pattern for multi-workspace apps.

## Document Lifecycle

### 1. Open Documents Before Querying

Documents must be opened before querying or modifying data within them.

```typescript
  await client.documents.open(documentId);
  const result = await Task.query({}, { documents: documentId });
```

Documents are ready to be queried once the `.open()` call finishes. Applications should wait for all required documents to be opened and show a loading state until all needed documents have been opened. Often it's handy to track this with an `isReady` ref.

**Wrong** — querying or saving before the document is open throws (or returns nothing for queries on no-document models):

```typescript
// DON'T: kick off open() and immediately query
jsBaoClient.documents.open(documentId);          // missing await
const result = await TodoItem.query({});         // throws DocumentClosedError on save,
                                                 // returns empty data for query
```

**Note on `jsBaoDocumentsStore.isReady`:** The demo app provides `jsBaoDocumentsStore` with an `isReady` property. This indicates that the **store itself** has finished initializing (the document list and invitation list have loaded) — it does NOT indicate that any particular document has been opened. You still need to track document-specific readiness separately (e.g., after calling `documents.open()`) before querying data in those documents.

**Where in the Vue tree to open documents:**

- **Open in pages/layouts/stores, not sub-components.** Sub-components receive readiness and data as props.
- **Open after authentication, not before.** Gate on `userStore.isAuthenticated` (not `isInitialized`). The template's `AppLayout` already gates rendering on `isAuthenticated`, so components mounted inside it can call `open()` safely.
- **Session-scoped documents** (small bounded set, < ~20): open once at app/layout level for the session.
- **Route-scoped documents** (per-page, unbounded count, or transient): open on route entry, close on route leave. Render a loading state until `documents.open()` resolves and (with `useJsBaoDataLoader`) `initialDataLoaded` is true.
- **Handle open failures explicitly** — surface an error or redirect. Don't silently continue.
- **`open()` is idempotent** — calling it on an already-open document is a no-op.

### 2. Finding documents a user can access

There is **no single "my documents" list**. A user reaches documents through **four distinct paths** — query each separately and combine in the UI. Do NOT try to unify them into one server-side list.

**a. Documents they own** (`ownedDocuments` — created, or ownership transferred):

```typescript
  // Paginated page — the unified { items, cursor } envelope, same shape as
  // sharedDocuments():
  const page = await client.me.ownedDocuments({
    tag: "channel",
    returnPage: true,
  });
  const { items, cursor } = page;

  // (Without `returnPage`, the JS client returns a flat `DocumentInfo[]` for
  // convenience: `const owned = await client.me.ownedDocuments({ tag: "channel" })`.)
```

**b. Documents shared directly with them** (`sharedDocuments` — non-owner `DocumentPermission` rows + pending `DocumentInvitation`s; group/collection shares do NOT appear here):

```typescript
  const { items, cursor } = await client.me.sharedDocuments({
    tag: "channel",
    limit: 50,
  });

  for (const doc of items) {
    // Each row carries the base document fields (title, createdAt, …) plus the
    // share extras (permission, source, grantedBy, invitationId).
    console.log(doc.title, doc.permission, doc.grantedBy);
  }

  // `cursor` is a raw-JSON pagination cursor — pass it back for the next page.
  if (cursor) {
    const next = await client.me.sharedDocuments({ cursor });
    return next;
  }
```

**c. Documents shared via a group** (`groups.listDocuments`):

```typescript
  const documents = await client.groups.listDocuments("team", "engineering");
```

**d. Documents shared via a collection** (`collections.listDocuments`):

```typescript
  const { items, cursor } = await client.collections.listDocuments(collectionId, {
    limit: 50,
  });
```

`ownedDocuments` and `sharedDocuments` return the unified `{ items, cursor }` envelope (raw-JSON `cursor`, NOT base64url). Each `SharedDocument` in `items` extends `DocumentInfo`: base document fields (`title`, `createdBy`, `createdAt`, `lastModified`, plus `tags`/`metadata`/`thumbnailBlobId` when set) plus the share-only extras `permission` (never `"owner"`), `source` (`"permission"` | `"invitation"`), `grantedBy`, `invitationId` (invitation rows only). In JS, `ownedDocuments()` returns a flat `DocumentInfo[]` by default and the envelope with `returnPage: true`; Swift always returns the envelope as `[String: Any]`.

For an "everything I can access" surface, combine these two calls with group and collection memberships:

```typescript
const owned  = await jsBaoClient.me.ownedDocuments();
const shared = (await jsBaoClient.me.sharedDocuments()).items;
const collections = await jsBaoClient.collections.list();
// then iterate collections / groups.listUserMemberships and call
// collections.listDocuments / groups.listDocuments.
```

`jsBaoClient.documents.hasLocalCopy(documentId)` is the synchronous local-cache check, useful when deciding whether to render skeletons before `open()` resolves.

#### Do not use

- **`client.documents.list()`** — deprecated. Returns the union of owner + reader + read-write rows and logs a console warning on every call. Use `me.ownedDocuments` and `me.sharedDocuments`; they have the same option set (`tag`, `limit`, `cursor`, `returnPage`).
- **`client.documents.createInvitation(...)`, `documents.acceptInvitation(...)`, `documents.declineInvitation(...)`, `documents.listPendingInvitationsForUser(...)`** — the per-document `DocumentInvitation` flow. Use `documents.updatePermissions(documentId, { email, ... })` for the share path; the platform creates an `AppInvitation` + `DeferredDocumentPermission` and the recipient redeems it via `client.invitations.accept(inviteToken)`. `client.me.pendingDocumentInvitations()` is the current "invitations I can accept" lookup.
- **`client.me.bookmarks.*`** — removed. There is no bookmarks API; render "my documents" from `me.ownedDocuments()` + `me.sharedDocuments()` (and `collections.list()` / `groups.listUserMemberships(...)` if you also want group/collection access).

## Core data operations (JavaScript + Swift)

Every example below is compiled against the real clients as part of the docs build. JavaScript uses generated model classes (`new Task(...)`, `Task.query(...)`); Swift uses a `TypedModel<Task>` bound to a document, with paged/aggregate/subscribe on its `.dynamic` layer. The deeper [Querying Data](#querying-data) and [Saving Data](#saving-data) sections below add JS-specific nuance (projections, includes, save options).

### Create

```typescript
  const task = new Task({
    title: "Review pull request",
    priority: 2,
    dueDate: new Date().toISOString(),
  });
  await task.save();
```

### Read (find / query / first / count)

```typescript
  // Find one by id
  const task = await Task.find("task-id");

  // Query with filters — returns a PaginatedResult; rows are on `.data`
  const urgent = await Task.query({ priority: { $gte: 2 }, completed: false });
  const rows = urgent.data;

  // First match (with a sort)
  const topTask = await Task.queryOne({ completed: false }, { sort: { priority: -1 } });

  // Count
  const remaining = await Task.count({ completed: false });
```

### Update

```typescript
  const task = await Task.find(taskId);
  if (task) {
    task.completed = true;
    await task.save();
  }
```

### Delete

```typescript
  const task = await Task.find(taskId);
  if (task) {
    await task.delete();
  }
```

### Upsert by natural key

```typescript
  const user = new AppUser({ email: "alice@example.com", name: "Alice" });
  // Creates a new record, or merges into the existing one with that email.
  await user.save({ upsertOn: "email" });
```

### Logical query operators

```typescript
  const result = await Task.query({
    $or: [
      { priority: 3 },
      { dueDate: { $lt: new Date().toISOString() } },
    ],
  });
```

### Sort + cursor pagination

```typescript
  const page1 = await Task.query(
    { completed: false },
    { limit: 20, sort: { priority: -1 } },
  );

  if (page1.nextCursor) {
    const page2 = await Task.query(
      { completed: false },
      { limit: 20, sort: { priority: -1 }, uniqueStartKey: page1.nextCursor },
    );
    return page2.data;
  }
```

### Aggregation

```typescript
  const stats = await Task.aggregate({
    groupBy: ["category"],
    operations: [
      { type: "count" },
      { type: "avg", field: "priority" },
      { type: "sum", field: "estimatedHours" },
    ],
    filter: { completed: false },
    sort: { field: "count", direction: -1 },
    limit: 10,
  });
```

### Subscribe to changes

```typescript
  const unsubscribe = Task.subscribe(() => {
    // re-query and update your UI
  });

  // later, when you no longer need updates:
  unsubscribe();
```

### Resolve-or-create a singleton document

```typescript
  const result = await client.documents.getOrCreateWithAlias({
    title: "My Data",
    alias: { scope: "user", aliasKey: "default-doc" },
  });
  await client.documents.open(result.documentId);
```

### Share a document (user / email / group)

```typescript
  // By user ID
  await client.documents.updatePermissions(documentId, {
    userId: "user-abc",
    permission: "read-write",
  });

  // By email — works whether or not the recipient is a member yet
  await client.documents.updatePermissions(documentId, {
    email: "colleague@example.com",
    permission: "read-write",
  });

  // With a group
  await client.documents.grantGroupPermission(documentId, {
    groupType: "team",
    groupId: "engineering",
    permission: "read-write",
  });
```

### Update thumbnail / metadata

```typescript
  await client.documents.update(documentId, {
    title: "Q2 Planning",
    thumbnailBlobId: blobId,                              // a blob you uploaded
    metadata: { color: "blue", tags: ["plan", "q2"] },   // ≤4KB JSON, replace semantics
  });
```

## Common Document Usage Patterns

**Helper Stores:** The demo app includes `jsBaoDocumentsStore` (the underlying tracked-documents store) and `singleDocumentStore` (a higher-level wrapper for Pattern 1 / Pattern 2) in `/src/stores/`. These stores handle document opening, closing, readiness tracking, and state management. They can be used as-is, customized to fit your needs, or ignored in favor of application-specific approaches.

### Pattern 1: Single Document (Personal Apps)

**Best for:** Personal tools, single-user apps, no sharing needed

Each user gets exactly one document that holds all their data. The document is opened on app load / user sign-in. No document management UI is needed.

**Examples:** Personal task manager, habit tracker, journal app, budgeting tool

**User experience:** Users sign in and immediately see their data. No concept of "documents" is exposed in the UI.

**Implementation** — resolve-or-create the per-user document on app init, then open it (see [Resolve-or-create a singleton document](#resolve-or-create-a-singleton-document) above for the compiled call). `result.created === true` if a new document was just created.

### Pattern 2: One Document at a Time (Workspaces)

**Best for:** Apps where users create discrete projects/workspaces they might share independently — accounting (per company), project management (per project), shared shopping lists (per household).

Users have multiple documents but work in one at a time, switching between them. Track a `currentDocument` ref and call `open()` on the chosen document.

**UI components** in `src/components/documents/`: `PrimitiveDocumentSwitcher` (sidebar dropdown) and `PrimitiveDocumentList` (full management page with rename/share/delete).

List with `me.ownedDocuments()` and `open()` the selected document; create a new workspace document with `create()` and open it:

```typescript
  const { metadata } = await client.documents.create({
    title: "New Project",
    tags: ["workspace"],
  });
  await client.documents.open(metadata.documentId);
```

### Pattern 3: Multiple Documents

**Best for:** Apps that query across many documents, each with its own sharing context — chat (per channel), multi-tenant dashboards, collaborative workspaces with distinct collections.

All documents that need live updates or cross-document queries must be open. Tag documents so you can fetch a set with `me.ownedDocuments({ tag })` (and `me.sharedDocuments({ tag })` if the user can also be a non-owner).

```typescript
// Open every document with a given tag
const channels = await jsBaoClient.me.ownedDocuments({ tag: "channel" });
await Promise.all(
  channels.map((ch) => jsBaoClient.documents.open(ch.documentId))
);

// Query runs across all open documents by default
const messages = await Message.query({});
```

**Implementation tips for Pattern 3:** The demo app does not ship a built-in "multi-document" Pinia store. For collective sharing of multiple documents as a unit, prefer the server-side Collections API (`client.collections.*` — see [Collections](#collections) below) over a local store. For per-tag in-memory tracking, build directly on `jsBaoClient.me.ownedDocuments({ tag })` and `jsBaoClient.documents.open()`, and track per-document readiness yourself.

A minimal store for "all documents tagged `channel`" (Vue/Pinia framework glue — web-specific, left inline):

```typescript
// stores/channelDocsStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useJsBaoClient } from "primitive-app";

export const useChannelDocs = defineStore("channelDocs", () => {
  const client = useJsBaoClient();
  const documentIds = ref<string[]>([]);
  const openedIds = ref<Set<string>>(new Set());
  const loadError = ref<Error | null>(null);

  // True only after every channel doc this user can see is open.
  const allReady = computed(
    () =>
      documentIds.value.length > 0 &&
      documentIds.value.every((id) => openedIds.value.has(id))
  );

  async function load() {
    loadError.value = null;
    try {
      const owned = await client.me.ownedDocuments({ tag: "channel" });
      const shared = (await client.me.sharedDocuments({ tag: "channel" })).items;
      documentIds.value = [...owned, ...shared].map((d) => d.documentId);
      await Promise.all(
        documentIds.value.map(async (id) => {
          await client.documents.open(id);
          openedIds.value.add(id);
        })
      );
    } catch (err) {
      loadError.value = err as Error;
    }
  }

  return { documentIds, openedIds, allReady, loadError, load };
});
```

Then feed `allReady` into `useJsBaoDataLoader` so queries don't run until every channel doc is open:

```typescript
const channelDocs = useChannelDocs();
onMounted(() => channelDocs.load());

const { data: messages } = useJsBaoDataLoader({
  documentReady: () => channelDocs.allReady,
  load: () => Message.query({}, { limit: 100 }),
});
```

The same pattern adapts to "the K most recent" or "channels the user belongs to" — change the `me.ownedDocuments` / `me.sharedDocuments` calls and the readiness condition; everything else stays.

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

Use tags to categorize documents by type. Pass `tags` to `create()`, filter the user's owned documents by tag server-side, or add/remove tags on an existing document:

```typescript
  // Filter the user's owned documents by tag
  const todoLists = await client.me.ownedDocuments({ tag: "todolist" });

  // Add a tag to an existing document
  await client.documents.addTag(documentId, "archived");

  // Remove a tag from a document
  await client.documents.removeTag(documentId, "archived");
```

You can also create a tagged document and filter locally:

```typescript
const { metadata } = await jsBaoClient.documents.create({
  title: "My List",
  tags: ["todolist"],
});

// Filter locally
const owned = await jsBaoClient.me.ownedDocuments();
const todoListsLocal = owned.filter((doc) => doc.tags?.includes("todolist"));
```

## Defining Models

### Creating New Model Files

Models are defined in `src/models/models.toml` and TypeScript classes are generated from that file. Follow this workflow:

**Step 1: Add the model to `src/models/models.toml`** using TOML syntax. Use snake_case for option names (`auto_assign`, `max_length`, etc.) — the loader maps them to camelCase at runtime.

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

**Step 2: Run `npx js-bao-codegen-v2`** to generate `Todo.generated.ts` and regenerate the barrel `src/models/index.ts`. Codegen emits a typed `TodoAttrs` interface, a merged `Todo` interface extending `BaseModel`, and a `Todo` class extending `BaseModelImpl`. The barrel auto-registers every model at app startup.

**Step 3: Import models from the barrel** (`src/models/index.ts`), never directly from `*.generated.ts` files. The barrel ensures every model is registered exactly once.

```typescript
import { Todo } from "@/models";
```

**Step 4: Make additional edits** to the schema in `models.toml` and run `npx js-bao-codegen-v2` again.

**CRITICAL: NEVER edit `*.generated.ts` files or `src/models/index.ts`.** Both are overwritten on every codegen run.

### Field Types

| Type        | Description                  | Common Options                 |
| ----------- | ---------------------------- | ------------------------------ |
| `id`        | Unique identifier            | `autoAssign: true`             |
| `string`    | Text values                  | `indexed: true`, `default: ""` |
| `number`    | Numeric values               | `indexed: true`, `default: 0`  |
| `boolean`   | True/false                   | `default: false`               |
| `date`      | ISO-8601 strings             | `indexed: true`                |
| `stringset` | Collection of strings (tags) | `maxCount: 20`                 |

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

### Defining Relationships in models.toml

Declare relationships in `models.toml` using `[models.X.relationships.Y]` sections. Codegen emits typed traversal methods on the generated interfaces.

```toml
# Author hasMany Posts
[models.authors.relationships.posts]
type = "hasMany"
model = "posts"
related_id_field = "authorId"
order_by_field = "createdAt"
order_direction = "DESC"

# Post refersTo Author
[models.posts.relationships.author]
type = "refersTo"
model = "authors"
related_id_field = "authorId"
```

After running `npx js-bao-codegen-v2`, the generated interfaces include typed traversal methods:

```typescript
// Author.generated.ts
export interface Author extends AuthorAttrs, BaseModel {
  posts(options?: PaginationOptions): Promise<PaginatedResult<Post>>;
}

// Post.generated.ts
export interface Post extends PostAttrs, BaseModel {
  author(): Promise<Author | null>;
}
```

Use these at runtime:

```typescript
const author = await Author.queryOne({ id: authorId });
const posts = await author.posts(); // PaginatedResult<Post>
const firstPost = posts.data[0];
const backRef = await firstPost.author(); // Author | null
```

Relationship traversal uses the same engine as `Model.query(...)` with `include` specs — see [Loading Related Data](#loading-related-data-includes) for the lower-level query-level include syntax.

### Unique Constraints

Two ways to enforce uniqueness — both declared in `models.toml`:

```toml
# 1. Single-field uniqueness via the field's `unique` option.
#    Use this whenever possible — enables `upsertOn` on save.
[models.users.fields.email]
type = "string"
unique = true
indexed = true

# 2. Multi-field (composite) uniqueness via [[models.X.unique_constraints]].
#    Each entry is a NAMED constraint — the name is what you pass to
#    upsertByUnique / findByUnique at runtime.
[[models.categories.unique_constraints]]
name = "name_parent_unique"
fields = ["name", "parentId"]
```

After `npx js-bao-codegen-v2`, single-field constraints get an auto-generated runtime name of `<modelName>_<fieldName>_unique` (e.g. `users_email_unique`); composite constraints use the `name` you declared (e.g. `name_parent_unique`).

**Wrong** — these TOML shapes are silently rejected or fail at codegen:

```toml novalidate
# DON'T: nesting under `options` — that's the programmatic
# defineModelSchema({ options: { uniqueConstraints } }) shape, not the
# TOML dialect. In TOML the array lives directly on the model.
[[models.categories.options.unique_constraints]]
name = "name_parent_unique"
fields = ["name", "parentId"]

# DON'T: bare array of fields. Each constraint must be a table with
# both `name` and `fields`.
unique_constraints = [["name", "parentId"]]
```

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

**Logical operators** — see [Logical query operators](#logical-query-operators) above for the compiled `$or` example. Plain field maps AND together:

```typescript
const result = await Task.query({
  completed: false,
  priority: { $gte: 3 },
  tags: { $in: ["work", "urgent"] },
});
```

### Pagination

Use cursor-based pagination for large result sets — see [Sort + cursor pagination](#sort--cursor-pagination) above for the compiled `nextCursor` / `uniqueStartKey` example.

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

Group and calculate statistics — see [Aggregation](#aggregation) above for the compiled call. The result is a **nested object keyed by group values** (not an array):

```typescript
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

`useJsBaoDataLoader` is a composable provided by the primitive library that centralizes data loading for a component. **It is component-only**: it registers its model subscriptions and document-event listeners inside `onMounted`, which fires only for mounted Vue components. Calling it from a Pinia store's `setup()`, a router guard, or any other non-component context will load data once but **never react to subsequent changes** — the `onMounted` callback never runs there, so no subscriptions are registered. For those contexts, subscribe directly (see [Subscribing Outside a Component](#subscribing-outside-a-component) below).

It handles four key concerns:

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

### Subscribing Outside a Component

`useJsBaoDataLoader` is the right tool inside a component. Outside one — a **Pinia store**, a singleton service, a router guard — do not reach for it: its `onMounted`-based subscriptions never register there, so reactive updates silently never fire.

`Model.subscribe(callback)` is a static method that works **anywhere**, independent of the Vue component lifecycle (see [Subscribe to changes](#subscribe-to-changes) above for the compiled call). It returns an unsubscribe function and fires the callback whenever any record of that model changes (local edits or sync from other clients). Wire it up directly in the store's `setup()` and keep the unsubscribe handle so you can tear it down (Vue/Pinia framework glue — web-specific, left inline):

```typescript
// stores/tasksStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { Task } from "@/models";

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  let unsubscribe: (() => void) | null = null;

  async function reload() {
    const result = await Task.query({ completed: false }, { sort: { priority: -1 } });
    tasks.value = result.data as Task[];
  }

  function start() {
    if (unsubscribe) return;            // idempotent — don't double-subscribe
    unsubscribe = Task.subscribe(reload); // fires on every Task change, in any context
    void reload();                        // initial load
  }

  function stop() {
    unsubscribe?.();
    unsubscribe = null;
  }

  return { tasks, reload, start, stop };
});
```

Call `start()` once when the store first comes into use (e.g. after login / first document open) and `stop()` when tearing down (e.g. on logout) to release the listener.

Rules:

- Make `subscribe` setup **idempotent** — guard with the stored unsubscribe handle so re-entry doesn't stack duplicate listeners that each trigger a reload.
- Always keep and eventually call the unsubscribe function; an orphaned listener leaks and keeps reloading after the store is no longer needed.
- The callback receives no arguments — re-run your query inside it; don't expect a changed-record payload.
- Subscribe only after the relevant documents are open, or your initial `reload()` may query before data is available.

This is the same `Model.subscribe()` that `useJsBaoDataLoader` calls internally — you are just registering it in a place that doesn't depend on `onMounted`.

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
const copy = { ...todo }; // drops every field; see "Model Instances Are Not Plain Objects"

// DO: read fields directly into a plain object when you need a snapshot.
const snapshot = { id: todo.id, title: todo.title, completed: todo.completed };
```

### Model Instances Are Not Plain Objects

A model instance is **not** a POJO, and you cannot spread or clone it. Each declared field is a getter/setter defined on the class **prototype** (backed internally by copy-on-write change tracking over the document's Yjs state) — *not* an own enumerable property on the instance. JavaScript's spread and rest operators only copy *own enumerable properties*, so they never invoke those getters and the field data is silently dropped.

```typescript
// ❌ All of these lose the model's field data — they do NOT throw, they just produce empty/partial objects:
const copy            = { ...task };              // field data gone
const { id, ...rest } = task;                     // `rest` is empty-ish
const updated         = { ...task, done: true };  // task's other fields are gone
await Message.create({ ...task });                // fields don't come along
```

There is no public `.attrs` bag and no public `.toJSON()` to spread either. To move a model's data into a plain object, read the fields you need explicitly:

```typescript
// ✅ Snapshot for serialization, an integration call, or structuredClone:
const snapshot = { id: task.id, title: task.title, done: task.done, priority: task.priority };

// ✅ Duplicate into a new record — list the fields; don't spread the source instance.
const dup = new Task({ title: task.title, priority: task.priority });
await dup.save({ targetDocument: docId });

// ✅ Mutate in place, then save — no copy needed.
task.done = true;
await task.save();
```

Note the direction: constructors (`new Task({...})`), `save()`, and `query`/`find` filters all accept plain objects, so spreading a *plain object* into them is fine. Spread only fails when the **source** of the spread is a model instance.

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

Delete a record after finding it — see [Delete](#delete) above for the compiled call.

### Upsert by Unique Constraint

`upsertByUnique(constraintName, lookupValue(s), data, options?)` — finds an existing record by a named constraint and updates it, or creates one if none exists. The `data` object MUST include the same constraint field values as `lookupValue` (mismatch throws). When creating a new record, `targetDocument` is REQUIRED.

```typescript
// Composite-key example — uses the constraint name declared in models.toml above.
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

Single-field constraints declared via `unique = true` in TOML get an auto-generated name of `<modelName>_<fieldName>_unique` (where `modelName` is the `[models.<name>]` block key). Use `[[models.X.options.unique_constraints]]` to control the name explicitly.

For single-field upserts where the value already lives on the instance, `save({ upsertOn })` is simpler than `upsertByUnique` — see [Upsert by natural key](#upsert-by-natural-key) above for the compiled call.

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

Use the `upsertOn` option in `save()` to upsert by a natural unique field (e.g., `email`, `slug`) without knowing the existing record's ID. The field must have a single-field `uniqueConstraints` entry on the model. See [Upsert by natural key](#upsert-by-natural-key) above for the compiled call.

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

Create a singleton model per document for metadata. Child models reference by model ID, not document ID — declared in `models.toml`:

```toml
# TodoList — one per document
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
```

Run `npx js-bao-codegen-v2` and import as `import { TodoList, TodoItem } from "@/models";`.

**Use this pattern when:**

- Documents represent a meaningful entity (project, list, workspace)
- You need document-level metadata
- Child models need to reference their parent container

### Singleton Documents with Aliases

For documents that should exist exactly once (default document, settings), use `getOrCreateWithAlias`. This single call atomically resolves an existing alias or creates a new document with that alias, eliminating race conditions when multiple clients initialize simultaneously. See [Resolve-or-create a singleton document](#resolve-or-create-a-singleton-document) above for the compiled call.

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

Documents can be shared with individual users (by userId or email), with groups, with collections, or exposed to a request-access flow for users with a link. For the full picture — member invitations with quotas, deferred grants, and access requests — see the [Sharing and Invitations guide](AGENT_GUIDE_TO_PRIMITIVE_SHARING_AND_INVITATIONS.md).

### Quick Reference

The core share calls — by userId, by email, and with a group — are in [Share a document (user / email / group)](#share-a-document-user--email--group) above. The full surface adds batch grants, deferred email shares, and access requests:

```typescript
// Batch — multiple users at once
await client.documents.updatePermissions(documentId, {
  permissions: [
    { userId: "user-abc", permission: "read-write" },
    { userId: "user-xyz", permission: "reader" },
  ],
});

// By email with notification — resolves if the user exists, otherwise creates a
// deferred grant that auto-applies when the recipient signs up. With
// `sendEmail: true`, `documentUrl` is required AND the app must have `baseUrl`
// configured (used to compose the accept URL for the deferred-share email).
// Both preconditions return HTTP 400 if missing.
await client.documents.updatePermissions(documentId, {
  email: "alice@example.com",
  permission: "read-write",
  sendEmail: true,
  documentUrl: `${window.location.origin}/lists`,
});
// Returns either a DirectPermissionGrant (existing user) or a
// DeferredPermissionGrant ({ invitationId, inviteToken, ... }) that the
// recipient redeems via client.invitations.accept(inviteToken) after signup.

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

Render the user's documents from two calls: `client.me.ownedDocuments()` for documents they own, and `client.me.sharedDocuments()` for documents shared directly with them (non-owner `DocumentPermission` plus pending `DocumentInvitation`s). Group- and collection-shared documents are listed through `groups.listDocuments` / `collections.listDocuments`.

### Using PrimitiveShareDocumentDialog

When allowing users to share documents, use `PrimitiveShareDocumentDialog` (Vue framework glue — web-specific, left inline):

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
  // Close and stop syncing
  await client.documents.close(documentId);

  // Close and remove the local cached copy (safe: skipped if not fully synced)
  const { evicted } = await client.documents.close(documentId, {
    evictLocal: true,
  });
  if (!evicted) {
    // Server was not fully in sync — local copy was retained
  }
```

When `evictLocal: true` is passed, the client performs a state vector check against the server before removing local data. If the server hasn't received all local writes (e.g. due to a brief network interruption), eviction is skipped and `evicted: false` is returned. This prevents data loss during WebSocket instability.

### Sync Verification

Use these methods to confirm the server has received your writes before taking irreversible actions (e.g., logging out, clearing local storage):

```typescript
  // Point-in-time checks
  const hasAllWrites = await client.documents.includesWrites(documentId);
  const fullyInSync = await client.documents.inSync(documentId);

  // Polling helpers: wait until confirmed
  await client.documents.waitForWriteConfirmation(documentId);
  await client.documents.waitForInSync(documentId);
```

The point-in-time checks return `false` if the client is disconnected or the check times out (JS accepts an optional `timeoutMs`; Swift's `includesWrites` / `inSync` are synchronous local reads). The `waitFor*` polling helpers exist on both `documents.*` and the client root: `waitForWriteConfirmation` returns true on success / false on timeout, and `waitForInSync` throws on timeout.

### Updating Document Metadata

Update a document's title, thumbnail, and presentation metadata — see [Update thumbnail / metadata](#update-thumbnail--metadata) above for the compiled call. Each field is optional; pass `null` to clear `thumbnailBlobId` or `metadata`.

```typescript
// Check if a document is currently open
const open = jsBaoClient.documents.isOpen(documentId);
```

`thumbnailBlobId` points at a blob you've already uploaded; the platform marks the referenced blob readable to anyone with access to the document. `metadata` is a JSON-serializable object with a 4KB cap on its serialized UTF-8 form — keep it to the kind of presentation hints that need to travel with the document (cover image references, badge colors, list layout). Failures return:

| Error code | Meaning |
|---|---|
| `METADATA_TOO_LARGE` | Serialized `metadata` exceeds 4KB |
| `BLOB_NOT_FOUND` | `thumbnailBlobId` references a blob the platform can't resolve |
| `BLOB_DOC_MISMATCH` | The blob exists but belongs to a different document |

### Deleting Documents

Delete a document (it must be closed first, or pass `forceCloseIfOpen: true`) — see the compiled call below. Root documents cannot be deleted.

```typescript
  // Must be closed first
  await client.documents.delete(documentId);

  // Force-close before deleting
  await client.documents.delete(documentId, { forceCloseIfOpen: true });
```

### Programmatic Sharing — Full Reference

Beyond the Quick Reference and the `PrimitiveShareDocumentDialog` UI, the full programmatic surface. Inspecting a document's current members and pending invites:

```typescript
  // Current members (accepted permission grants)
  const members = await client.documents.getPermissions(documentId);

  // Pending email invites on this document
  const pending = await client.documents.listPendingInvitations(documentId);
```

```typescript
await jsBaoClient.documents.listGroupPermissions(documentId);

// Mutate access — by user id
await jsBaoClient.documents.updatePermissions(documentId, {
  userId, permission: "read-write",
});
await jsBaoClient.documents.updatePermissions(documentId, {
  permissions: [{ userId, permission: "reader" }, ...],
});

// Mutate access — by email (single canonical entry point for sharing).
// Resolves to a direct grant if the user exists, or a deferred grant
// (carrying invitationId + inviteToken) if not. With `sendEmail: true`:
// `documentUrl` is REQUIRED AND `app.baseUrl` must be configured (the
// deferred branch uses it to compose the accept URL). Both preconditions
// return HTTP 400 if missing. Repeated calls with the same email are
// idempotent — an existing pending DeferredDocumentPermission for the
// same (documentId, email) is updated in place, not duplicated.
await jsBaoClient.documents.updatePermissions(documentId, {
  email: "user@example.com",
  permission: "read-write",
  sendEmail: true,
  documentUrl: `${origin}/lists`,
  note: "...",
});

// Remove access — by user id or email
await jsBaoClient.documents.removePermission(documentId, userId);
await jsBaoClient.documents.removePermission(documentId, { email }); // also cancels a pending deferred grant
await jsBaoClient.documents.transferOwnership(documentId, newOwnerId);

// Group access
await jsBaoClient.documents.grantGroupPermission(documentId, {
  groupType, groupId, permission: "read-write",
});
await jsBaoClient.documents.revokeGroupPermission(documentId, groupType, groupId);

// Recipient redeems a deferred grant (after signup or in a different session)
// using the inviteToken returned from updatePermissions.
await client.invitations.accept(inviteToken);
```

The access-request flow (a user with a link requests access; an owner lists and approves) is compiled here:

```typescript
  // A user with the link requests access
  await client.documents.requestAccess(documentId, {
    permission: "read-write",
    message: "Please add me to this doc",
  });

  // An owner lists pending requests and approves one
  const requests = await client.documents.listAccessRequests(documentId);
  await client.documents.approveAccessRequest(documentId, requestId);
```

### Collections

Group documents into a **collection** to share them as a unit. Permissions granted on a collection materialize onto all current and future documents in it.

**Key properties:**
- Permissions are **additive, max-wins** — a collection can only add access, never restrict it.
- A document can be in multiple collections; access from all sources combines.
- Deleting a collection revokes its permissions but never deletes the documents or any direct grants.
- Member access is O(1) regardless of collection size (uses system-managed groups internally).
- **Cascade rule:** sharing a collection automatically propagates access to every document inside it (current and future). Don't add per-document grants for documents already shared at the collection level — the collection grant is canonical. Prefer collection-level sharing over per-document sharing whenever the same set of users should see a related set of docs.

Create a collection, add/remove documents, and share it with a group or an individual user:

```typescript
  // Create
  const collection = await client.collections.create({
    name: "Q1 Reports",
    description: "All quarterly report documents",
  });

  // Add / remove documents
  await client.collections.addDocument(collection.collectionId, documentId);
  await client.collections.removeDocument(collection.collectionId, documentId);

  // Share with a group (fans out to every document in the collection)
  await client.collections.grantGroupPermission(collection.collectionId, {
    groupType: "team",
    groupId: "engineering",
    permission: "read-write",
  });

  // Share with an individual user (O(1)). userId only — no email form.
  await client.collections.addMember(collection.collectionId, {
    userId: targetUserId,
    permission: "reader",
  });
```

A collection's members + pending invites in one call:

```typescript
  const access = await client.collections.getAccess(collectionId);
```

Additional collection calls:

```typescript
// Optional, immutable-after-create — bind create() to a CollectionTypeConfig
// rule set and an external entity (exposed to CEL as collection.contextId).
const collection = await client.collections.create({
  name: "Q1 Reports",
  collectionType: "class-reports",
  contextId: "math-101",
});

// List
await client.collections.listDocuments(collection.collectionId);
// → { items: CollectionDocumentInfo[], cursor?: string }
await client.collections.listCollectionsForDocument(documentId);

await client.collections.revokeGroupPermission(collection.collectionId, "team", "engineering");
await client.collections.removeMember(collection.collectionId, targetUserId);
// Change a user's permission: call addMember again with the new level.
```

> **Gap (#671):** `collections.addMember` accepts `userId` only — no email-based deferred grant, and there's no `collections.listPendingInvitations` to power a "Members + Pending" UI on a collection. To share a collection with someone who hasn't signed up, either get them into the app first (`client.invitations.create({ email })`, or share an individual document by email so the deferred-grant flow runs) and add them to the collection after signup, or share the collection with a group they'll be a member of.

For per-context CEL rules using `collectionType` + `contextId` (and the `hasCollectionAccess` helper), see [Rule Sets for Collection Management](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md#rule-sets-for-collection-management) in the Users and Groups guide.

**CLI:**

```bash
primitive collections create "Q1 Reports" --description "Quarterly reports"
primitive collections list
primitive collections docs {add|remove|list} <collection-id> [<document-id>]
primitive collections share <collection-id> --group team/engineering --permission read-write
primitive collections unshare <collection-id> --group team/engineering
primitive collections members add <collection-id> <user-id> --permission reader
primitive collections members remove <collection-id> <user-id>
primitive collections access <collection-id>
```

### Read-Only Permission Handling

When a user has "reader" permission, disable all edit functionality (Vue computed — web-specific, left inline):

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
| Store loads once but never reacts to changes    | `useJsBaoDataLoader` called outside a component — its `onMounted` subscriptions never register | In a Pinia store / non-component context call `Model.subscribe(reload)` directly in `setup()`. See [Subscribing Outside a Component](#subscribing-outside-a-component) |
| Spread/clone of a model is empty or missing fields | Fields are prototype getters, not own properties, so `{ ...model }` / `{ id, ...rest }` copy nothing | Read fields explicitly: `{ id: model.id, title: model.title }`. See [Model Instances Are Not Plain Objects](#model-instances-are-not-plain-objects) |
| Query `field: false` misses items               | Items with `field: undefined` don't match `field: false`                 | Use a default value in schema, OR filter in JavaScript with `item.field ?? false`                    |
| Document created but not in sidebar/list        | Created via `documents.create()` directly without updating tracked state | Use the demo `jsBaoDocumentsStore.createDocument()` (or your own tracker) so reactive lists update   |
| HTTP 400 when sharing with email                | Missing `documentUrl` in invitation                                       | Pass `invite-url-template` prop to `PrimitiveShareDocumentDialog`                                    |
| New document not queryable immediately          | Document not opened after creation                                        | After `documents.create()`, call `documents.open(metadata.documentId)` before querying              |
| `setPermissions is not a function`              | Method doesn't exist                                                      | Use `updatePermissions(documentId, { userId, permission })`                                          |
| `setGroupPermission is not a function`          | Method doesn't exist                                                      | Use `grantGroupPermission(documentId, { groupType, groupId, permission })`                           |
| "Model not properly initialized" on save/query  | Schema not registered — `*.generated.ts` or `index.ts` is out of sync with `models.toml` | Re-run `npx js-bao-codegen-v2`; never manually attach a schema or edit generated files               |
| `upsertByUnique`: "constraint not found"        | Passed field array instead of constraint name                             | Pass the named constraint string (e.g. `"users_email_unique"`)                                       |
| `upsertByUnique`: "targetDocument is required"  | Creating a new record without specifying its document                     | Pass `{ targetDocument: docId }` as the 4th argument                                                 |
| `query()` result missing `.map`/`.filter`       | Forgot result is a `PaginatedResult`                                      | Use `result.data` (also has `.nextCursor`, `.hasMore`)                                               |
