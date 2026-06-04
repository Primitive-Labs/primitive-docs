# Working with Documents

Documents are Primitive's local-first collaborative storage. A document is a container that holds your data models — synced across devices, shared with other users, and available offline. This guide covers document concepts, data modeling, and CRUD operations.

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
Data lives in a local database on the device. Your app works without a network connection — changes queue and sync when connectivity returns.

### Size Guidelines
Documents work best under ~10MB each. For most apps this means thousands of records per document. If you need more, split data across multiple documents.

## Defining Models

Models define the typed shape of the data your app stores in documents — like `Task`, `Project`, or `Contact`. **All document interaction happens through models**: you author them in one TOML file, codegen produces the typed classes/structs, and every read and write goes through those types.

| | Web (Vue) | iOS (SwiftUI) |
|---|---|---|
| Schema file | `src/models/models.toml` | `Sources/<App>/Models/schema.toml` |
| Codegen | `pnpm codegen` (run after editing) | Automatic on build (`./run-ios.sh` regenerates first; `swift build` runs the SPM plugin) |
| Output | `*.generated.ts` classes + `@/models` barrel | `PrimitiveModel` structs in `Models/Generated/` |

The TOML dialect is identical on both platforms — the same schema file works for web and iOS clients sharing an app.

::: info Documents vs. databases
This models-and-codegen loop is how **documents** work. Server-side **databases** are different: the client interface there is *registered operations* (with codegen over the operations, not models), and a database's optional schema is an advisory map rather than an enforced contract — see [Working with Databases](./working-with-databases.md).
:::

### Why TOML + Codegen

Defining models in TOML, with codegen producing the TypeScript classes, gives you:

- **Reviewable diffs** — your data model lives in one config file, versioned alongside your code. A schema change is one diff, not many.
- **Strong typing for free** — the generator emits typed `*Attrs` interfaces, model classes, and traversal methods for declared relationships. You can't typo a field name.
- **Auto-registration** — the generated `src/models/index.ts` barrel registers every model with `js-bao` exactly once at app startup. Nothing to remember to wire up.
- **Sync validation at boot** — the barrel checks that `models.toml` and the generated classes match. If they're out of sync, the app throws at startup and tells you to re-run codegen.

### The Authoring Loop

A typical model change is three small steps: edit the TOML, regenerate, use the types.

::: code-group

```bash [Web (Vue)]
# 1. Edit src/models/models.toml
# 2. Regenerate:
pnpm codegen
# 3. Import from @/models and use like any other class
```

```bash [iOS (SwiftUI)]
# 1. Edit Sources/<App>/Models/schema.toml
# 2. Regenerate — codegen is wired into both build paths:
./run-ios.sh        # regenerates, then builds + launches (Xcode path)
swift build         # the SPM plugin regenerates automatically
# 3. Consume the generated structs through TypedModel<T>
```

:::

On web, the `codegen` script runs `npx js-bao-codegen-v2 -i src/models/models.toml -o src/models` under the hood. On iOS, `swift-bao-codegen` writes into `Models/Generated/` (gitignored, regenerated every build).

::: warning Never edit generated files
The codegen output — `*.generated.ts` + the `src/models/index.ts` barrel on web, `Models/Generated/*.swift` on iOS — is overwritten on each run. Make all changes in the TOML. For custom behavior on top of a generated type: on web, define free functions in `src/lib/`; on iOS, add a companion extension file *alongside* (not inside) `Models/Generated/`, e.g. `Models/TaskRecord+Extensions.swift` — the codegen sweep only touches files carrying its generated banner, so extensions survive each regen.
:::

::: warning iOS: build through run-ios.sh after schema changes
If you edit `schema.toml` and then hit **Run in Xcode directly**, Xcode compiles whatever stale files are already in `Models/Generated/` with no error pointing at the cause. Build through `./run-ios.sh` (it regenerates first), or run `swift build` once before the Xcode build.
:::

### Authoring `models.toml`

Each model is a top-level `[models.<name>]` block. Fields go under `[models.<name>.fields.<fieldName>]`. Relationships go under `[models.<name>.relationships.<relName>]`.

Field option names use `snake_case` in TOML (the loader maps them to camelCase at runtime).

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

[models.todos.fields.priority]
type = "number"
default = 0

[models.todos.fields.due_date]
type = "date"

[models.todos.fields.tags]
type = "stringset"
max_count = 10
```

#### Field Types

| Type        | TypeScript    | Description                          | Common Options                  |
| ----------- | ------------- | ------------------------------------ | ------------------------------- |
| `id`        | `string`      | Unique identifier                    | `auto_assign = true`, `indexed` |
| `string`    | `string`      | Text value                           | `indexed`, `default`, `unique`  |
| `number`    | `number`      | Numeric value                        | `indexed`, `default`            |
| `boolean`   | `boolean`     | True/false                           | `default`                       |
| `date`      | `string`      | ISO-8601 timestamp string            | `indexed`                       |
| `stringset` | `StringSet`   | Set-of-strings (tags, categories)    | `max_count`                     |

#### Field Options

```toml
[models.tasks.fields.id]
type = "id"
auto_assign = true     # server-assigns a ULID on save
indexed = true         # required for fast lookup by id

[models.tasks.fields.email]
type = "string"
unique = true          # single-field uniqueness — enables upsertOn
indexed = true

[models.tasks.fields.priority]
type = "number"
default = 0

[models.tasks.fields.tags]
type = "stringset"
max_count = 10
```

#### Unique Constraints

Two ways to enforce uniqueness:

**Single-field uniqueness** — set `unique = true` on the field. This also enables `upsertOn` for that field on save.

```toml
[models.users.fields.email]
type = "string"
unique = true
indexed = true
```

**Composite (multi-field) uniqueness** — declare a named constraint with `[[models.<name>.unique_constraints]]`.

```toml
[[models.categories.unique_constraints]]
name = "name_parent_unique"
fields = ["name", "parentId"]
```

The constraint `name` is what you pass to `upsertByUnique` / `findByUnique` at runtime.

### Relationships

Declare relationships in TOML and codegen emits typed traversal methods on the generated interfaces.

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

After `pnpm codegen`, the generated interfaces include typed traversal methods:

```typescript
import { Author, Post } from "@/models";

const author = await Author.queryOne({ id: authorId });
const posts = await author.posts();        // PaginatedResult<Post>
const firstPost = posts.data[0];
const backRef = await firstPost.author();  // Author | null
```

| Relationship type | Returns                            | Required options                            |
| ----------------- | ---------------------------------- | ------------------------------------------- |
| `hasMany`         | `Promise<PaginatedResult<T>>`      | `model`, `related_id_field`                 |
| `refersTo`        | `Promise<T \| null>`               | `model`, `related_id_field`                 |
| `refersToMany`    | `Promise<T[]>`                     | `model`, `source_field` (an array of IDs)   |

Optional ordering: `order_by_field` and `order_direction = "ASC" | "DESC"` apply to `hasMany` and `refersToMany`.

### Using Generated Models

Always import from the barrel, never directly from a `*.generated.ts` file:

```typescript
import { Todo, Author, Post } from "@/models";

// Create
const todo = new Todo({ title: "Review PR", priority: 2 });
await todo.save();

// Query
const open = await Todo.query({ completed: false });
```

The barrel runs `attachAndRegisterModel` for every model exactly once — that's why importing from `@/models` is essential. Importing directly from `Todo.generated.ts` skips registration, which fails at runtime with "Model not properly initialized" on the first save or query.

On iOS, codegen emits value-type `PrimitiveModel` structs (`Codable`, `Equatable`, `Hashable`) — set `class_name = "TaskRecord"` on the model block to control the Swift type name. You consume them through a `TypedModel<T>` bound to an open document (see [Working with Documents](./working-with-documents.md#creating-and-opening-documents)). A few Swift conventions worth knowing:

- **IDs are `String`** — generate with `UUID().uuidString` when the caller doesn't supply one.
- **`type = "number"` codegens a `Double`** — cast to `Int` on read if you need to.
- **No nulls** — the CRDT layer doesn't model `nil`. Use `""` / `0` for absent values and check them explicitly.
- **Dates round-trip as ISO-8601 `String`s** — there's no native date type on the wire.
- **Wire keys are forever** — renaming a TOML key orphans existing records on every platform. Keep wire keys snake_case so they round-trip cleanly between web and iOS, and add camelCase aliases in a `+Extensions.swift` companion if the Swift call sites read awkwardly.

### Iterating on the Schema

You're free to evolve the schema as the app grows. A few rules of thumb:

- **Add new fields freely** — js-bao stores documents as Yjs CRDTs, so adding an optional field is a no-op for existing records.
- **Adding `default` doesn't backfill** — existing records keep their absent values; `default` only applies to records created after the change. Read sites should treat the field as optional.
- **Don't remove fields** — the underlying Yjs data is still there. Mark unused fields with a TOML comment instead, and stop reading them.
- **Renaming a field is a breaking change** — pick a new field with a new name, write to both during a migration window, then stop writing the old one. Add `default` only for the new field.
- **Adding a `unique = true` constraint to an existing field** can fail at save time if existing records collide. Inspect the data before tightening uniqueness.

The `index.ts` barrel will throw at startup if `models.toml` and the generated classes drift apart. If you see that error, run `pnpm codegen` and commit the regenerated files.

## CRUD Operations

### Create

A record is created and saved locally first, then synced in the background.

::: code-group

<<< ../../examples/documents/model-create.ts#example{ts} [JavaScript]

<<< ../../examples/documents/model-create.swift#example{swift} [Swift]

:::

In single-document mode a JavaScript `save()` targets the active document; otherwise pass `{ targetDocument }`.

### Read

Find by id, query with filters, get the first match, or count.

::: code-group

<<< ../../examples/documents/model-read.ts#example{ts} [JavaScript]

<<< ../../examples/documents/model-read.swift#example{swift} [Swift]

:::


### Update

::: code-group

<<< ../../examples/documents/model-update.ts#example{ts} [JavaScript]

<<< ../../examples/documents/model-update.swift#example{swift} [Swift]

:::

Both look the record up first, then apply the change.

### Delete

::: code-group

<<< ../../examples/documents/model-delete.ts#example{ts} [JavaScript]

<<< ../../examples/documents/model-delete.swift#example{swift} [Swift]

:::

### Upsert by Natural Key

Save-or-update by a unique field (such as `email`) without knowing the existing record's id. The field must have a single-field unique constraint.

::: code-group

<<< ../../examples/documents/model-upsert.ts#example{ts} [JavaScript]

<<< ../../examples/documents/model-upsert.swift#example{swift} [Swift]

:::

For composite keys, use `upsertByUnique(constraintName, …)` — see [Unique Constraints](#unique-constraints) above.

::: tip iOS semantics
Under a bound `TypedModel`, reads are **synchronous** against the local CRDT (`tasks.findAll()`, `tasks.query([...])` — no `await`). `create` is the only CRUD call that throws (it validates required fields, types, and unique constraints); `update`/`delete` don't throw, and unknown field keys in an `update` payload are dropped silently. Writes are local-first: visible to local reads on the next line, synced to peers in the background.
:::

## Querying

### Operators

| Operator | Description | Example |
|---|---|---|
| `$eq` / `$ne` | Equals / not equals | `{ status: { $ne: "deleted" } }` |
| `$gt` / `$gte` / `$lt` / `$lte` | Comparisons | `{ priority: { $gte: 2 } }` |
| `$in` / `$nin` | In / not in array | `{ status: { $in: ["pending", "active"] } }` |
| `$startsWith` / `$endsWith` | String prefix / suffix | `{ name: { $startsWith: "Project" } }` |
| `$containsText` | Case-insensitive contains | `{ title: { $containsText: "urgent" } }` |
| `$contains` | StringSet contains value | `{ tags: { $contains: "tutorial" } }` |
| `$exists` | Field exists | `{ dueDate: { $exists: true } }` |

### Logical Operators

Combine conditions with `$or` / `$and`. The filter shape is identical across clients (a dictionary/object).

::: code-group

<<< ../../examples/documents/query-logical.ts#example{ts} [JavaScript]

<<< ../../examples/documents/query-logical.swift#example{swift} [Swift]

:::

### Sorting and Pagination

Pass a sort and a page size, then carry the cursor forward.

::: code-group

<<< ../../examples/documents/query-paginate.ts#example{ts} [JavaScript]

<<< ../../examples/documents/query-paginate.swift#example{swift} [Swift]

:::

In Swift, cursor pagination lives on the `.dynamic` layer (`queryPaged`); use `sortOrder` (an ordered list) so the cursor is stable across pages.

### Aggregations

Group-by with `count` / `avg` / `sum` / `min` / `max`, an optional pre-filter, sort, and limit.

::: code-group

<<< ../../examples/documents/aggregate.ts#example{ts} [JavaScript]

<<< ../../examples/documents/aggregate.swift#example{swift} [Swift]

:::

When you group by a `stringset` field (like `tags`), each member value becomes its own group — a tag-facet count.

## Reacting to Changes

Data can change from sync (another user edited it). Subscribe to keep your UI current — the callback fires on both local and synced remote writes. Always release the subscription when you're done.

::: code-group

<<< ../../examples/documents/subscribe.ts#example{ts} [JavaScript]

<<< ../../examples/documents/subscribe.swift#example{swift} [Swift]

:::

Most apps don't call `subscribe` directly in views — each starter template ships a framework helper that wraps it: **`useJsBaoDataLoader`** (Vue composable) and **`BaoDataLoader`** (SwiftUI loader in `PrimitiveApp`). Both handle document readiness, debounced reloads, and a loaded/empty/loading phase:

::: code-group

<<< ../../examples/documents/dataloader-glue.ts#example{ts} [Web (Vue)]

<<< ../../examples/documents/dataloader-glue.swift#example{swift} [iOS (SwiftUI)]

:::

For code that subscribes to client events directly on iOS (`client.events.on(...)`): the returned `EventSubscription` must be **stored on a property** or it's dropped immediately, use `[weak self]` in the closure, and cancel on teardown with `sub?.cancel()`.

## Creating and Opening Documents

Create a document with `documents.create()` — it returns the new document's metadata, including the `documentId` everything else keys off:

::: code-group

<<< ../../examples/documents/create-document.ts#example{ts} [JavaScript]

<<< ../../examples/documents/create-document.swift#example{swift} [Swift]

:::

A document must be **open** before you can read or write the data inside it — queries and saves only see open documents:

::: code-group

<<< ../../examples/documents/doc-open-query.ts#example{ts} [JavaScript]

<<< ../../examples/documents/doc-open-query.swift#example{swift} [Swift]

:::

The document is ready as soon as `open()` resolves — await it before the first query and show a loading state until then. `open()` is idempotent, so re-opening an already-open document is a no-op.

Only keep open the documents you actually need — the ones you're querying or want real-time updates from. Every open document is synced continuously, and in JavaScript queries span all open documents by default, so an unneeded open document costs sync traffic and widens query results. Close documents you're done with:

::: code-group

<<< ../../examples/documents/close-document.ts#example{ts} [JavaScript]

<<< ../../examples/documents/close-document.swift#example{swift} [Swift]

:::

### Ensuring Exactly One Document with Aliases

Some apps need exactly one document of a given kind — a personal app's "the user's data". Creating it with an **alias** guarantees one and only one exists, even when several devices race to create it: `getOrCreateWithAlias` resolves-or-creates atomically:

::: code-group

<<< ../../examples/documents/get-or-create-doc.ts#example{ts} [JavaScript]

<<< ../../examples/documents/get-or-create-doc.swift#example{swift} [Swift]

:::

::: tip Why getOrCreateWithAlias?
Splitting this into a resolve followed by a create looks fine but has a race: two devices onboarding at the same moment both fall into the create branch and you lose one of the docs. `getOrCreateWithAlias` is a single atomic server-side upsert.
:::

### Opening Documents on iOS

On iOS, the canonical place to open documents and bind models is your `PrimitiveAppState` subclass — open in `connectClient()`, bind in the `onDocumentOpened` hook:

```swift
@MainActor
final class MyAppState: PrimitiveAppState {
  @Published private(set) var tasks: TypedModel<TaskRecord>?

  override func connectClient() async {
    await super.connectClient()
    guard let client else { return }
    let result = try? await client.documents.getOrCreateWithAlias(
      alias: DocumentAlias(scope: .user, aliasKey: "library"),
      title: "Library"
    )
    guard let id = result?.documentId else { return }
    await selectDocumentAwaiting(id)
  }

  override func onDocumentOpened(doc: YDocument, documentId: String) async {
    tasks = makeTypedModel(doc: doc, documentId: documentId)
  }
}
```

One `TypedModel` per record type per document. Prefer `makeTypedModel(doc:documentId:)` over direct construction — it also registers the model with the in-app Debug Inspector.

## Common Document Usage Patterns

A document is both the unit of sync and the unit of sharing, so "how many documents should my app have?" follows from how the data is shared. Three shapes cover most apps:

**One document per user.** All of a user's data lives in a single private document, resolved with an alias at sign-in ([above](#ensuring-exactly-one-document-with-aliases)) and kept open for the whole session. The UI never mentions documents — users sign in and see their data. Personal task managers, journals, habit trackers.

**One document per sharing context.** Anything shared as a unit — a project, a company's books, a household shopping list — gets its own document, shared with exactly the people in that context. Users work in one at a time: list them with the [`me` listing APIs](#finding-documents-a-user-can-access), open the selected one, and close it when they switch.

**Many documents, queried together.** Apps like chat read across several sharing contexts at once — each channel is its own document, all open simultaneously. Tag documents at creation (`tags: ["channel"]`) so you can fetch the set with `me.ownedDocuments({ tag })`, then open each one. In JavaScript a query then spans all open documents; in Swift each document gets its own `TypedModel`. To share a set of documents as one unit, use [Collections](#collections) rather than sharing each individually.

Whether a feature belongs in documents at all — versus a server-side database — is its own decision: see [Choosing Your Data Model](./choosing-your-data-model.md).

## Sharing Documents

Documents are private until you grant a permission level (`reader` | `read-write` | `owner`, see [the table above](#private-by-default)) to a user, an email, or a group:

::: code-group

<<< ../../examples/documents/share-document.ts#example{ts} [JavaScript]

<<< ../../examples/documents/share-document.swift#example{swift} [Swift]

:::

### Share by Email

The most common case — you have a colleague's email but don't know (or care) whether they've signed up yet. If the email belongs to an existing user, access is granted immediately. If not, the share waits and applies automatically when they sign up — see [Invitations](./invitations.md#how-invitations-resolve) for how that resolution works. Repeated shares to the same recipient are idempotent — the latest `permission` wins.

Batch shares can mix user IDs and emails:

::: code-group

<<< ../../examples/sharing/share-batch.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/share-batch.swift#example{swift} [Swift]

:::

To have the platform email the recipient, pass `sendEmail: true` along with a `documentUrl`, and make sure your app's base URL is configured — the server uses them to compose the share and accept links.

### Share with a Group

Grant document access to everyone in a group (the `grantGroupPermission` call in the example above). When group membership changes, document access updates automatically.

### Who Has Access? (Members + Pending)

Sharing UIs typically show two sections: people who currently have access, and people who've been invited but haven't signed up yet:

::: code-group

<<< ../../examples/sharing/document-members.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/document-members.swift#example{swift} [Swift]

:::

### Removing Someone

One call handles both "currently has access" and "invited but hasn't signed up yet" — pass an email and the server removes the matching member *or* cancels the pending grant, whichever exists:

::: code-group

<<< ../../examples/sharing/share-remove.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/share-remove.swift#example{swift} [Swift]

:::

Use the email form whenever you don't want to think about whether the target has signed up yet.

## Collections

Sharing one document at a time stops scaling as soon as access maps to a *set* of documents — a project's files, a course's materials, a client folder. A **collection** bundles documents so they can be shared as a unit: adding a member to a collection grants them access to every document currently in it *and* to any document added later. Remove a document from the collection (or a member from the collection) and the access goes with it.

::: code-group

<<< ../../examples/sharing/collection-create.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/collection-create.swift#example{swift} [Swift]

:::

Collections sit between single-document shares and groups: share a *document* when access is about that one thing, share a *collection* when access is about a set of documents, and use a *group* when access is about who someone is (a team, a role). Membership works like document sharing — add by user ID or by email (email adds to non-users resolve at signup, like any [deferred grant](./invitations.md#sharing-with-people-who-arent-users-yet)), and list current members and pending invitations:

::: code-group

<<< ../../examples/sharing/collection-access.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/collection-access.swift#example{swift} [Swift]

:::

```typescript
const pending = await client.collections.listPendingInvitations(collectionId);
// [{ email, permission, invitationId, ... }]
```

## Finding Documents a User Can Access

There is no single "my documents" list. A user reaches documents through **four distinct paths**, and you query each one separately — combine them in your UI as needed:

### 1. Documents they own

Created by the user, or had ownership transferred to them.

::: code-group

<<< ../../examples/documents/list-owned.ts#example{ts} [JavaScript]

<<< ../../examples/documents/list-owned.swift#example{swift} [Swift]

:::

### 2. Documents shared directly with them

Non-owner permission grants plus pending document invitations. Each row carries the base document fields plus the share extras (`permission`, `source`, `grantedBy`, `invitationId`).

::: code-group

<<< ../../examples/documents/list-shared.ts#example{ts} [JavaScript]

<<< ../../examples/documents/list-shared.swift#example{swift} [Swift]

:::

### 3. Documents shared via a group

Listed through the group the user belongs to.

::: code-group

<<< ../../examples/documents/list-group-documents.ts#example{ts} [JavaScript]

<<< ../../examples/documents/list-group-documents.swift#example{swift} [Swift]

:::

### 4. Documents shared via a collection

Listed through a collection the user is a member of.

::: code-group

<<< ../../examples/documents/list-collection-documents.ts#example{ts} [JavaScript]

<<< ../../examples/documents/list-collection-documents.swift#example{swift} [Swift]

:::

`ownedDocuments` and `sharedDocuments` accept `tag` / `limit` / `cursor` for filtering and pagination.

## Document-Scoped Blobs

Documents can carry binary files — images, PDFs, attachments. Each blob belongs to one document and is reached through that document's blob context; uploads, downloads, and listing all hang off it. The key idea: **document-scoped blobs inherit the sharing of their document**. Anyone who can read the document can read its blobs, anyone with write access can add or delete them, and when you share the document its files come along — there's no separate permission system to manage. Each blob is capped at 10 MB.

### Uploading Files

::: code-group

<<< ../../examples/blobs/doc-blob-upload.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/doc-blob-upload.swift#example{swift} [Swift]

:::

### Displaying Images

::: code-group

```typescript [JavaScript]
const imageUrl = blobs.downloadUrl(blobId, { disposition: "inline" });
```

```swift [Swift]
let imageUrl = blobs.downloadUrl(blobId: blobId, disposition: .inline)
```

:::

```vue
<template>
  <img :src="imageUrl" alt="User uploaded image" />
</template>
```

The URL includes authentication, so it only works for signed-in users with document access.

### Downloading Files

::: code-group

<<< ../../examples/blobs/doc-blob-read.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/doc-blob-read.swift#example{swift} [Swift]

:::

`downloadUrl` is synchronous and authenticated.

### Listing and Managing Blobs

::: code-group

<<< ../../examples/blobs/doc-blob-manage.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/doc-blob-manage.swift#example{swift} [Swift]

:::

### Caching and Upload Queuing

Blob storage tolerates flaky connections:

- **Uploads queue** when the network drops and complete automatically when it returns
- **Downloaded files cache** locally, so repeat reads are instant
- **Prefetch files** proactively to warm the cache:

```typescript
await blobs.prefetch([blobId1, blobId2], { concurrency: 4 });
```

Use the **Blob Explorer** in the [dev tools](./devtools.md) overlay to browse, upload, and manage blobs during development.

For file storage that isn't tied to a document — avatars, workflow outputs, public assets, time-boxed download links — use a blob bucket instead: see [Blobs and Files](./blobs-and-files.md).

## Document Thumbnails and Metadata

Documents carry presentation fields you can update at any time.

::: code-group

<<< ../../examples/documents/update-metadata.ts#example{ts} [JavaScript]

<<< ../../examples/documents/update-metadata.swift#example{swift} [Swift]

:::

`thumbnailBlobId` points at a blob you've already uploaded; the platform makes the thumbnail readable to anyone with access to the document. `metadata` is a small JSON blob (4KB cap) for UI hints — pass `null` to clear either field.

## Document Access Requests

When a user has a document link (or ID) but no permission, they can request access — the Google-Docs-style "Request access" flow. A `403` from `client.documents.get(documentId)` includes a `canRequestAccess` hint when the document accepts requests:

```typescript
try {
  await client.documents.get(documentId);
} catch (err) {
  if (err.code === "DOC_ACCESS_DENIED" && err.details?.canRequestAccess) {
    // Show a "Request access" button
  }
}
```

The full flow — submit a request (`permission` is required), then an owner lists and approves:

::: code-group

<<< ../../examples/sharing/request-access.ts#example{ts} [JavaScript]

<<< ../../examples/sharing/request-access.swift#example{swift} [Swift]

:::

Owners can also deny, optionally pointing the requester at the document's canonical URL:

```typescript
await client.documents.denyAccessRequest(documentId, requestId, {
  documentUrl: "https://myapp.example/docs/sales-handbook",
});
```

The requester gets an email with the outcome either way. To show pending requests in an owner's UI, fetch them when the view opens:

```typescript
const requests = await client.documents.listAccessRequests(documentId);
```

Behavior worth knowing: requests expire after 30 days, a requester can't re-submit while a request for the same document is pending, and a resolved request can't be re-resolved.

## Next Steps

- **[Choosing Your Data Model](./choosing-your-data-model.md)** — When to use documents vs. databases
- **[Invitations](./invitations.md)** — App membership, and how shares to not-yet-users resolve
- **[Working with Databases](./working-with-databases.md)** — Server-side structured storage
