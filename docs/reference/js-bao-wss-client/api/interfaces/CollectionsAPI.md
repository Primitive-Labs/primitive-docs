[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CollectionsAPI

# Interface: CollectionsAPI

## Methods

### addDocument()

> **addDocument**(`collectionId`, `documentId`): `Promise`\<[`CollectionDocumentInfo`](CollectionDocumentInfo.md)\>

Add a document to a collection.

#### Parameters

##### collectionId

`string`

The unique identifier of the collection to add the document to

##### documentId

`string`

The unique identifier of the document to add

#### Returns

`Promise`\<[`CollectionDocumentInfo`](CollectionDocumentInfo.md)\>

***

### addMember()

> **addMember**(`collectionId`, `params`): `Promise`\<[`CollectionMemberInfo`](CollectionMemberInfo.md)\>

Add a member to a collection.

#### Parameters

##### collectionId

`string`

The unique identifier of the collection to add the member to

##### params

`AddCollectionMemberParams`

Member details

#### Returns

`Promise`\<[`CollectionMemberInfo`](CollectionMemberInfo.md)\>

***

### create()

> **create**(`params`): `Promise`\<[`CollectionInfo`](CollectionInfo.md)\>

Create a new collection.

#### Parameters

##### params

`CreateCollectionParams`

Configuration for the new collection

#### Returns

`Promise`\<[`CollectionInfo`](CollectionInfo.md)\>

***

### delete()

> **delete**(`collectionId`): `Promise`\<\{ `success`: `boolean`; \}\>

Delete a collection.

#### Parameters

##### collectionId

`string`

The unique identifier of the collection to delete

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### get()

> **get**(`collectionId`): `Promise`\<[`CollectionInfo`](CollectionInfo.md)\>

Get collection info by ID.

Callers must either be an admin/owner of the app, hold a direct
`_col-reader` or `_col-writer` membership on the collection, or belong
to a user-group that has been granted a `CollectionGroupPermission` of
`reader` or `read-write`. Otherwise the server returns 404 (to avoid
leaking collection existence).

#### Parameters

##### collectionId

`string`

The unique identifier of the collection to retrieve

#### Returns

`Promise`\<[`CollectionInfo`](CollectionInfo.md)\>

***

### getAccess()

> **getAccess**(`collectionId`): `Promise`\<[`CollectionAccessInfo`](CollectionAccessInfo.md)\>

Get the current user's access info for a collection.

#### Parameters

##### collectionId

`string`

The unique identifier of the collection to check access for

#### Returns

`Promise`\<[`CollectionAccessInfo`](CollectionAccessInfo.md)\>

***

### grantGroupPermission()

> **grantGroupPermission**(`collectionId`, `params`): `Promise`\<[`CollectionGroupPermissionInfo`](CollectionGroupPermissionInfo.md)\>

Grant a group permission to a collection.

#### Parameters

##### collectionId

`string`

The unique identifier of the collection to grant access to

##### params

`GrantCollectionGroupPermissionParams`

Permission grant details

#### Returns

`Promise`\<[`CollectionGroupPermissionInfo`](CollectionGroupPermissionInfo.md)\>

***

### list()

> **list**(`options?`): `Promise`\<`PaginatedResult`\<[`CollectionInfo`](CollectionInfo.md)\>\>

List collections the caller is a direct member of (reader or read-write).

This returns only collections the caller has been explicitly added to —
it does NOT include collections accessible only via a user-created group
that holds a `CollectionGroupPermission`. Admins see only their own direct
memberships too; use `listAll()` for the full app-wide set.

Each returned item includes a `permission` field (`"reader"` or
`"read-write"`) reflecting the caller's direct access level.

#### Parameters

##### options?

`PaginationOptions`

Pagination controls

#### Returns

`Promise`\<`PaginatedResult`\<[`CollectionInfo`](CollectionInfo.md)\>\>

***

### listAll()

> **listAll**(`options?`): `Promise`\<`PaginatedResult`\<[`CollectionInfo`](CollectionInfo.md)\>\>

List every collection in the app (admin-only).

Non-admin callers receive a 403. Unlike `list()`, the returned items do
not include a `permission` field (since the caller may not have direct
access to many of them).

#### Parameters

##### options?

`PaginationOptions`

Pagination controls

#### Returns

`Promise`\<`PaginatedResult`\<[`CollectionInfo`](CollectionInfo.md)\>\>

***

### listCollectionsForDocument()

> **listCollectionsForDocument**(`documentId`, `options?`): `Promise`\<`PaginatedResult`\<[`DocumentCollectionInfo`](DocumentCollectionInfo.md)\>\>

List collections that contain a specific document.

For admin/owner callers, returns every collection the document belongs
to. For non-admin callers, returns only collections the caller is a
direct member of (`_col-reader` or `_col-writer`). Access via a
user-created group is NOT counted here (consistent with `list()`).

#### Parameters

##### documentId

`string`

The unique identifier of the document to look up

##### options?

`PaginationOptions`

Pagination controls

#### Returns

`Promise`\<`PaginatedResult`\<[`DocumentCollectionInfo`](DocumentCollectionInfo.md)\>\>

***

### listDocuments()

> **listDocuments**(`collectionId`, `options?`): `Promise`\<`PaginatedResult`\<[`CollectionDocumentInfo`](CollectionDocumentInfo.md)\>\>

List all documents in a collection.

#### Parameters

##### collectionId

`string`

The unique identifier of the collection whose documents to list

##### options?

`PaginationOptions`

Pagination controls

#### Returns

`Promise`\<`PaginatedResult`\<[`CollectionDocumentInfo`](CollectionDocumentInfo.md)\>\>

***

### removeDocument()

> **removeDocument**(`collectionId`, `documentId`): `Promise`\<\{ `success`: `boolean`; \}\>

Remove a document from a collection.

#### Parameters

##### collectionId

`string`

The unique identifier of the collection to remove the document from

##### documentId

`string`

The unique identifier of the document to remove

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### removeMember()

> **removeMember**(`collectionId`, `userId`): `Promise`\<\{ `success`: `boolean`; \}\>

Remove a member from a collection.

#### Parameters

##### collectionId

`string`

The unique identifier of the collection to remove the member from

##### userId

`string`

The unique identifier of the user to remove

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### revokeGroupPermission()

> **revokeGroupPermission**(`collectionId`, `groupType`, `groupId`): `Promise`\<\{ `success`: `boolean`; \}\>

Revoke a group's permission from a collection.

#### Parameters

##### collectionId

`string`

The unique identifier of the collection to revoke access from

##### groupType

`string`

The kind of group whose permission is being revoked

##### groupId

`string`

The unique identifier of the group losing the permission

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### update()

> **update**(`collectionId`, `params`): `Promise`\<[`CollectionInfo`](CollectionInfo.md)\>

Update a collection's title or description.

#### Parameters

##### collectionId

`string`

The unique identifier of the collection to update

##### params

`UpdateCollectionParams`

Fields to update on the collection

#### Returns

`Promise`\<[`CollectionInfo`](CollectionInfo.md)\>
