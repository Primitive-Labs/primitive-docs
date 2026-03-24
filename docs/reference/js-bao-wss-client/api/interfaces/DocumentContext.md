[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DocumentContext

# Interface: DocumentContext

Scoped API for operating on a single document without repeating the document ID.

## Methods

### acceptInvitation()

> **acceptInvitation**(): `Promise`\<[`DocumentAccessResult`](DocumentAccessResult.md)\>

Accept a pending invitation to access this document.

#### Returns

`Promise`\<[`DocumentAccessResult`](DocumentAccessResult.md)\>

***

### blobs()

> **blobs**(): [`DocumentBlobContext`](DocumentBlobContext.md)

Get the blob API context for this document.

#### Returns

[`DocumentBlobContext`](DocumentBlobContext.md)

***

### declineInvitation()

> **declineInvitation**(`invitationId`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Decline a pending invitation to access this document.

#### Parameters

##### invitationId

`string`

The identifier of the specific invitation to decline

#### Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

***

### delete()

> **delete**(`options?`): `Promise`\<`void`\>

Delete this document from the server and evict its local data.

#### Parameters

##### options?

`DeleteDocumentOptions`

Options for document deletion

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(): `Promise`\<[`DocumentInfo`](DocumentInfo.md)\>

Fetch this document's metadata from the server.

#### Returns

`Promise`\<[`DocumentInfo`](DocumentInfo.md)\>

***

### getLocalMetadata()

> **getLocalMetadata**(): `Promise`\<`LocalMetadataEntry` \| `null`\>

Get locally cached metadata for this document.

#### Returns

`Promise`\<`LocalMetadataEntry` \| `null`\>

***

### getPermissions()

> **getPermissions**(): `Promise`\<[`DocumentPermissionEntry`](DocumentPermissionEntry.md)[]\>

Get the list of user permissions for this document.

#### Returns

`Promise`\<[`DocumentPermissionEntry`](DocumentPermissionEntry.md)[]\>

***

### getUploadConcurrency()

> **getUploadConcurrency**(): `number`

Get the current maximum number of concurrent blob uploads.

#### Returns

`number`

***

### grantGroupPermission()

> **grantGroupPermission**(`params`): `Promise`\<[`DocumentGroupPermissionEntry`](DocumentGroupPermissionEntry.md)\>

Grant a group permission on this document.

#### Parameters

##### params

`GrantGroupPermissionParams`

The group permission to grant

#### Returns

`Promise`\<[`DocumentGroupPermissionEntry`](DocumentGroupPermissionEntry.md)\>

***

### isReadOnly()

> **isReadOnly**(): `boolean`

Check whether this document is read-only for the current user.

#### Returns

`boolean`

***

### isRoot()

> **isRoot**(): `boolean`

Check whether this document is the app's root document.

#### Returns

`boolean`

***

### listGroupPermissions()

> **listGroupPermissions**(): `Promise`\<[`DocumentGroupPermissionEntry`](DocumentGroupPermissionEntry.md)[]\>

List all group-based permissions for this document.

#### Returns

`Promise`\<[`DocumentGroupPermissionEntry`](DocumentGroupPermissionEntry.md)[]\>

***

### pauseAllUploads()

> **pauseAllUploads**(): `void`

Pause all blob uploads for this document.

#### Returns

`void`

***

### pauseUpload()

> **pauseUpload**(`blobId`): `boolean`

Pause a specific blob upload for this document.

#### Parameters

##### blobId

`string`

The identifier of the blob upload to pause

#### Returns

`boolean`

***

### resumeAllUploads()

> **resumeAllUploads**(): `void`

Resume all paused blob uploads for this document.

#### Returns

`void`

***

### resumeUpload()

> **resumeUpload**(`blobId`): `boolean`

Resume a specific paused blob upload for this document.

#### Parameters

##### blobId

`string`

The identifier of the paused blob upload to resume

#### Returns

`boolean`

***

### revokeGroupPermission()

> **revokeGroupPermission**(`groupType`, `groupId`): `Promise`\<\{ `success`: `boolean`; \}\>

Revoke a group's permission on this document.

#### Parameters

##### groupType

`string`

The type of group whose permission to revoke

##### groupId

`string`

The identifier of the group whose permission to revoke

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### setUploadConcurrency()

> **setUploadConcurrency**(`concurrency`): `void`

Set the maximum number of concurrent blob uploads.

#### Parameters

##### concurrency

`number`

The maximum number of blob uploads that can run simultaneously

#### Returns

`void`

***

### transferOwnership()

> **transferOwnership**(`newOwnerId`): `Promise`\<`void`\>

Transfer ownership of this document to another user.

#### Parameters

##### newOwnerId

`string`

The user ID of the new owner

#### Returns

`Promise`\<`void`\>

***

### update()

> **update**(`data`): `Promise`\<[`DocumentInfo`](DocumentInfo.md)\>

Update this document's metadata such as its title.

#### Parameters

##### data

`UpdateDocumentData`

The document metadata fields to update

#### Returns

`Promise`\<[`DocumentInfo`](DocumentInfo.md)\>

***

### uploads()

> **uploads**(): [`BlobUploadStatus`](BlobUploadStatus.md)[]

List active blob uploads for this document.

#### Returns

[`BlobUploadStatus`](BlobUploadStatus.md)[]
