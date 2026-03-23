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

List collections the user has access to.

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
