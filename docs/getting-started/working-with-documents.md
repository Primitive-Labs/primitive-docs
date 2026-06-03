# Working with Documents

Documents are Primitive's local-first collaborative storage. A document is a container that holds your data models — synced across devices, shared with other users, and available offline. This guide covers document concepts, data modeling, and CRUD operations.

::: tip Two clients, one API
The examples below are shown in both **JavaScript** (`js-bao` / `js-bao-wss-client`) and **Swift** (the iOS client) — pick the tab for your platform. The API shape and semantics line up across both; where they differ, the text calls it out. Every snippet is compiled against the real client as part of the docs build.
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
Data lives in a local database on the device. Your app works without a network connection — changes queue and sync when connectivity returns.

### Size Guidelines
Documents work best under ~10MB each. For most apps this means thousands of records per document. If you need more, split data across multiple documents.

## Defining Models

Models define the shape of your data — like `Task`, `Project`, or `Contact`. Models are authored in TOML (`models.toml` for JavaScript, `schema.toml` for Swift — same format) and typed classes are generated from that file: `npx js-bao-codegen-v2` for JavaScript, `swift-bao-codegen` for Swift.

The full authoring loop — field types, options, relationships, uniqueness, and schema evolution — is covered in [Defining Your Models](./defining-your-models.md). Everything below assumes a generated `Task` model.

## CRUD Operations

### Create

A record is created and saved locally first, then synced in the background.

::: code-group

<<< ../../examples/documents/model-create.ts#example{ts} [JavaScript]

<<< ../../examples/documents/model-create.swift#example{swift} [Swift]

:::

In JavaScript a model is a class with instance `.save()`; in Swift a `TypedModel<Task>` (bound to one document) does the writes. In single-document mode the JS save targets the active document; otherwise pass `{ targetDocument }`.

### Read

Find by id, query with filters, get the first match, or count.

::: code-group

<<< ../../examples/documents/model-read.ts#example{ts} [JavaScript]

<<< ../../examples/documents/model-read.swift#example{swift} [Swift]

:::

`query()` returns a `PaginatedResult` in JavaScript — rows are on `.data`. In Swift, `query()` returns the rows directly and `count` lives on the `.dynamic` layer.

### Update

::: code-group

<<< ../../examples/documents/model-update.ts#example{ts} [JavaScript]

<<< ../../examples/documents/model-update.swift#example{swift} [Swift]

:::

Both look the record up first. JavaScript mutates the loaded object and saves it; Swift applies a partial update keyed by id.

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

For composite keys, use `upsertByUnique(constraintName, …)` — see [Defining Your Models](./defining-your-models.md).

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

Open a document before querying or writing data in it. For a per-user singleton document (a personal app's "the user's data"), `getOrCreateWithAlias` resolves-or-creates atomically:

::: code-group

<<< ../../examples/documents/get-or-create-doc.ts#example{ts} [JavaScript]

<<< ../../examples/documents/get-or-create-doc.swift#example{swift} [Swift]

:::

::: tip Why getOrCreateWithAlias?
Splitting this into a resolve followed by a create looks fine but has a race: two devices onboarding at the same moment both fall into the create branch and you lose one of the docs. `getOrCreateWithAlias` is a single atomic server-side upsert.
:::

Other patterns: **one document at a time** (list the user's owned documents, open the selected one) and **multiple open documents** (open several; in JavaScript a query then runs across all open documents, while in Swift each document has its own `TypedModel`).

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

## Sharing Documents

Share by user id, by email (the grant resolves at signup if they aren't a member yet), or with an entire group.

::: code-group

<<< ../../examples/documents/share-document.ts#example{ts} [JavaScript]

<<< ../../examples/documents/share-document.swift#example{swift} [Swift]

:::

For the full sharing story — member invitations with quotas, email-based grants, and access requests — see [Sharing and Invitations](./sharing-and-invitations.md).

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

`ownedDocuments` and `sharedDocuments` both return the `{ items, cursor }` envelope and accept `tag` / `limit` / `cursor`. (In JavaScript, `ownedDocuments()` returns a flat array by default and the `{ items, cursor }` page when you pass `returnPage: true`; Swift always returns the envelope.)

## Document Thumbnails and Metadata

Documents carry presentation fields you can update at any time.

::: code-group

<<< ../../examples/documents/update-metadata.ts#example{ts} [JavaScript]

<<< ../../examples/documents/update-metadata.swift#example{swift} [Swift]

:::

`thumbnailBlobId` points at a blob you've already uploaded; the platform makes the thumbnail readable to anyone with access to the document. `metadata` is a small JSON blob (4KB cap) for UI hints — pass `null` to clear either field.

## Document Access Requests

A `403` from getting a document can include a `canRequestAccess` hint. Users with a document link can submit a request, and document owners can approve or deny it. See [Sharing and Invitations](./sharing-and-invitations.md#document-access-requests).

## Next Steps

- **[Choosing Your Data Model](./choosing-your-data-model.md)** — When to use documents vs. databases
- **[Defining Your Models](./defining-your-models.md)** — TOML authoring, codegen, relationships, schema evolution
- **[Sharing and Invitations](./sharing-and-invitations.md)** — Full sharing, invitations, and access requests
- **[Defining Your Models](./defining-your-models.md)** — The TOML schema + codegen loop on both platforms
- **[Working with Databases](./working-with-databases.md)** — Server-side structured storage
