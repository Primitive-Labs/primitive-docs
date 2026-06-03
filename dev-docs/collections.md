# collections — `client.collections`

Group documents into collections and manage their membership, group permissions, and pending invitations.

::: tip Divergent shape
Every `CollectionsAPI` method exists in both clients, but the Swift client takes and
returns **untyped `[String: Any]`** where JS uses named interfaces
(`CollectionInfo`, `PaginatedResult<T>`, `{ success: boolean }`, …) — so the Swift
snippets below cast out of dictionaries. Both compile; the shapes differ
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)). Two specifics worth
flagging:

- **`addMember`** returns JS's `CollectionAddMemberResult` discriminated union
  (`added` / `already_member` / `pending_signup`) but a flat `[String: Any]` in Swift —
  branch on the `status` key yourself ([#453](https://github.com/Primitive-Labs/js-bao-wss/issues/453)).
- **`listAll`** takes positional `limit`/`cursor` args in Swift, while every sibling
  (`list`, `listDocuments`, `listCollectionsForDocument`) takes a `PaginationOptions`.
:::

## create(params)

Create a new collection. `name` is required; `collectionType`/`contextId` are immutable after create.

::: code-group
<<< ./snippets/collections/create.ts#example{ts} [JavaScript]
<<< ./snippets/collections/create.swift#example{swift} [Swift]
:::

## list(options?)

List collections the caller is a direct member of. Each item carries a `permission` field.

::: code-group
<<< ./snippets/collections/list.ts#example{ts} [JavaScript]
<<< ./snippets/collections/list.swift#example{swift} [Swift]
:::

## listAll(options?)

List every collection in the app (admin-only). Items do not carry a `permission` field.

::: code-group
<<< ./snippets/collections/list-all.ts#example{ts} [JavaScript]
<<< ./snippets/collections/list-all.swift#example{swift} [Swift]
:::

## get(collectionId)

Get collection info by ID. Callers without any access receive a 404.

::: code-group
<<< ./snippets/collections/get.ts#example{ts} [JavaScript]
<<< ./snippets/collections/get.swift#example{swift} [Swift]
:::

## update(collectionId, params)

Update a collection's name or description.

::: code-group
<<< ./snippets/collections/update.ts#example{ts} [JavaScript]
<<< ./snippets/collections/update.swift#example{swift} [Swift]
:::

## delete(collectionId)

Delete a collection. Returns `{ success: boolean }` (an untyped dict in Swift).

::: code-group
<<< ./snippets/collections/delete.ts#example{ts} [JavaScript]
<<< ./snippets/collections/delete.swift#example{swift} [Swift]
:::

## addDocument(collectionId, documentId)

Add a document to a collection.

::: code-group
<<< ./snippets/collections/add-document.ts#example{ts} [JavaScript]
<<< ./snippets/collections/add-document.swift#example{swift} [Swift]
:::

## removeDocument(collectionId, documentId)

Remove a document from a collection. Returns `{ success: boolean }`.

::: code-group
<<< ./snippets/collections/remove-document.ts#example{ts} [JavaScript]
<<< ./snippets/collections/remove-document.swift#example{swift} [Swift]
:::

## listDocuments(collectionId, options?)

List documents in a collection, each with the caller's effective permission.

::: code-group
<<< ./snippets/collections/list-documents.ts#example{ts} [JavaScript]
<<< ./snippets/collections/list-documents.swift#example{swift} [Swift]
:::

## listCollectionsForDocument(documentId, options?)

List collections that contain a specific document.

::: code-group
<<< ./snippets/collections/list-collections-for-document.ts#example{ts} [JavaScript]
<<< ./snippets/collections/list-collections-for-document.swift#example{swift} [Swift]
:::

## getAccess(collectionId)

Get the current user's access info for a collection (groups + members).

::: code-group
<<< ./snippets/collections/get-access.ts#example{ts} [JavaScript]
<<< ./snippets/collections/get-access.swift#example{swift} [Swift]
:::

## grantGroupPermission(collectionId, params)

Grant a group a permission level on a collection.

::: code-group
<<< ./snippets/collections/grant-group-permission.ts#example{ts} [JavaScript]
<<< ./snippets/collections/grant-group-permission.swift#example{swift} [Swift]
:::

## revokeGroupPermission(collectionId, groupType, groupId)

Revoke a group's permission from a collection. Returns `{ success: boolean }`.

::: code-group
<<< ./snippets/collections/revoke-group-permission.ts#example{ts} [JavaScript]
<<< ./snippets/collections/revoke-group-permission.swift#example{swift} [Swift]
:::

## addMember(collectionId, params)

Add a member by `userId` or `email` (mutually exclusive). Returns a discriminated union keyed on `status` in JS; a flat dict in Swift.

::: code-group
<<< ./snippets/collections/add-member.ts#example{ts} [JavaScript]
<<< ./snippets/collections/add-member.swift#example{swift} [Swift]
:::

## removeMember(collectionId, userId)

Remove a member from a collection. Returns `{ success: boolean }`.

::: code-group
<<< ./snippets/collections/remove-member.ts#example{ts} [JavaScript]
<<< ./snippets/collections/remove-member.swift#example{swift} [Swift]
:::

## listPendingInvitations(collectionId)

List pending (deferred, non-expired) invitations for a collection.

::: code-group
<<< ./snippets/collections/list-pending-invitations.ts#example{ts} [JavaScript]
<<< ./snippets/collections/list-pending-invitations.swift#example{swift} [Swift]
:::
