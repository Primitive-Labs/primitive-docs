# collections — `client.collections`

Group documents into collections and manage their membership, group permissions, and pending invitations.

::: tip Now typed (Swift)
All 16 `CollectionsAPI` methods are fully typed in the Swift client, matching
the JS named interfaces field-for-field
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)):

- Inputs take typed option structs (`CreateCollectionParams`,
  `UpdateCollectionParams`, `GrantCollectionGroupPermissionParams`,
  `AddCollectionMemberParams`) instead of `[String: Any]` literals.
- Outputs decode to named models (`CollectionInfo`, `CollectionDocumentInfo`,
  `CollectionAccessInfo`, `PendingCollectionInvitationEntry`, …); paginated
  reads return the shared `PaginatedResult<T>` (`.items` / `.cursor`).
- **`addMember`** returns the `CollectionAddMemberResult` discriminated union
  — `.direct(DirectCollectionAdd)` (`status` `"added"` / `"already_member"`)
  or `.deferred(DeferredCollectionAdd)` (`"pending_signup"`). Build params
  with `.user(...)` / `.email(...)` (userId XOR email,
  [#671](https://github.com/Primitive-Labs/js-bao-wss/issues/671)).
- **Mutators** (`delete` / `removeDocument` / `revokeGroupPermission` /
  `removeMember`) return `SuccessResult { success }`; a malformed response now
  throws a decode error rather than silently returning an empty dict.
- **`listAll`** keeps its `limit` / `cursor` params and returns
  `PaginatedResult<CollectionInfo>`; the cursor is now percent-encoded into
  the request path.
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

Delete a collection. Returns `{ success: boolean }` (`SuccessResult` in Swift).

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

Add a member by `userId` or `email` (mutually exclusive). Returns a discriminated union keyed on `status` — `CollectionAddMemberResult` in Swift.

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
