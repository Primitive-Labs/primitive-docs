[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DocumentsAPI

# Interface: DocumentsAPI

## Properties

### aliases

> **aliases**: [`DocumentAliasesAPI`](DocumentAliasesAPI.md)

## Methods

### acceptInvitation()

> **acceptInvitation**(`documentId`): `Promise`\<[`DocumentAccessResult`](DocumentAccessResult.md)\>

Accept a pending invitation to access a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document whose invitation to accept

#### Returns

`Promise`\<[`DocumentAccessResult`](DocumentAccessResult.md)\>

***

### addTag()

> **addTag**(`documentId`, `tag`): `Promise`\<`string`[]\>

Add a tag to a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document to tag

##### tag

`string`

The tag string to add

#### Returns

`Promise`\<`string`[]\>

***

### blobs()

> **blobs**(`documentId`): [`DocumentBlobContext`](DocumentBlobContext.md)

Get the blob API context for a specific document.

#### Parameters

##### documentId

`string`

The document whose blob context to retrieve

#### Returns

[`DocumentBlobContext`](DocumentBlobContext.md)

***

### cancelPendingCreate()

> **cancelPendingCreate**(`documentId`, `opts?`): `Promise`\<`void`\>

Cancel a pending local document create and optionally evict its local data.

#### Parameters

##### documentId

`string`

The unique identifier of the pending document to cancel

##### opts?

Cancellation options

###### evictLocal?

`boolean`

If true, also removes the document's local data from storage after cancellation

#### Returns

`Promise`\<`void`\>

***

### close()

> **close**(`documentId`, `options?`): `Promise`\<\{ `evicted`: `boolean`; \}\>

Close an open document and optionally evict its local data.
When evictLocal is true, the server is first checked to confirm it has all
the client's writes. If it doesn't, eviction is skipped and { evicted: false }
is returned.

#### Parameters

##### documentId

`string`

The unique identifier of the document to close

##### options?

Close options

###### evictLocal?

`boolean`

If true, also removes the document's local data from storage after closing

#### Returns

`Promise`\<\{ `evicted`: `boolean`; \}\>

- Whether local data was actually evicted

***

### commitOfflineCreate()

> **commitOfflineCreate**(`documentId`, `opts?`): `Promise`\<\{ `created`: `boolean`; `linked?`: `boolean`; `reason?`: `string`; \}\>

Commit a locally created document to the server.

#### Parameters

##### documentId

`string`

The unique identifier of the locally created document to commit

##### opts?

Commit options

###### onExists?

`"link"` \| `"fail"`

Behavior when the document already exists on the server: "link" associates the local document with the existing server document, "fail" throws an error

#### Returns

`Promise`\<\{ `created`: `boolean`; `linked?`: `boolean`; `reason?`: `string`; \}\>

***

### create()

> **create**(`options`): `Promise`\<\{ `metadata`: `any`; \}\>

Create a new document, optionally as local-only with automatic server commit.

#### Parameters

##### options

`CreateDocumentOptions`

Options for document creation

#### Returns

`Promise`\<\{ `metadata`: `any`; \}\>

***

### createInvitation()

> **createInvitation**(`documentId`, `email`, `permission`, `options?`): `Promise`\<[`DocumentInvitationResponse`](DocumentInvitationResponse.md)\>

Create an invitation to share a document with a user by email.

#### Parameters

##### documentId

`string`

The unique identifier of the document to share

##### email

`string`

The email address of the user to invite

##### permission

The permission level to grant the invitee

`"read-write"` | `"reader"`

##### options?

Optional email notification settings

###### documentUrl?

`string`

URL included in the invitation email so the recipient can navigate to the document

###### note?

`string`

A personal message included in the invitation email

###### sendEmail?

`boolean`

If true, sends an email notification to the invitee

#### Returns

`Promise`\<[`DocumentInvitationResponse`](DocumentInvitationResponse.md)\>

***

### ~~createOffline()~~

> **createOffline**(`_options`): `Promise`\<`Doc`\>

#### Parameters

##### \_options

`CreateOfflineOptions`

#### Returns

`Promise`\<`Doc`\>

#### Deprecated

Use [documents.create](#create)({ localOnly: true }) followed by
[documents.open](#open)(id, { waitForLoad: 'local', enableNetworkSync: false }) instead.

#### See

CreateDocumentOptions

***

### createWithAlias()

> **createWithAlias**(`options`): `Promise`\<\{ `alias`: [`DocumentAliasInfo`](DocumentAliasInfo.md); `createdAt`: `string`; `createdBy`: `string`; `documentId`: `string`; `modifiedAt`: `string`; `title`: `string`; \}\>

Create a document with an alias atomically, failing if the alias already exists.

#### Parameters

##### options

`CreateWithAliasOptions`

Options for document and alias creation

#### Returns

`Promise`\<\{ `alias`: [`DocumentAliasInfo`](DocumentAliasInfo.md); `createdAt`: `string`; `createdBy`: `string`; `documentId`: `string`; `modifiedAt`: `string`; `title`: `string`; \}\>

The created document's `documentId`, `title`, `createdBy`, timestamps, and the assigned `alias`

***

### declineInvitation()

> **declineInvitation**(`documentId`, `invitationId`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Decline a pending invitation to access a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document whose invitation to decline

##### invitationId

`string`

The identifier of the specific invitation to decline

#### Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

***

### delete()

> **delete**(`documentId`, `opts?`): `Promise`\<`void`\>

Delete a document from the server and evict its local data.

#### Parameters

##### documentId

`string`

The unique identifier of the document to delete

##### opts?

`DeleteDocumentOptions`

Options for document deletion

#### Returns

`Promise`\<`void`\>

***

### deleteInvitation()

> **deleteInvitation**(`documentId`, `invitationId`): `Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

Delete a document invitation.

#### Parameters

##### documentId

`string`

The unique identifier of the document whose invitation to delete

##### invitationId

`string`

The identifier of the specific invitation to delete

#### Returns

`Promise`\<\{ `message`: `string`; `success`: `boolean`; \}\>

***

### evict()

> **evict**(`documentId`, `opts?`): `Promise`\<`void`\>

Evict a document's local data from the device.

#### Parameters

##### documentId

`string`

The unique identifier of the document to evict

##### opts?

`EvictDocumentOptions`

Eviction options

#### Returns

`Promise`\<`void`\>

***

### evictAll()

> **evictAll**(`opts?`): `Promise`\<`void`\>

Evict all locally stored document data from the device.

#### Parameters

##### opts?

`EvictAllDocumentsOptions`

Eviction options

#### Returns

`Promise`\<`void`\>

***

### for()

> **for**(`documentId`): [`DocumentContext`](DocumentContext.md)

Get a DocumentContext scoped to a specific document.

#### Parameters

##### documentId

`string`

The document to create a scoped context for

#### Returns

[`DocumentContext`](DocumentContext.md)

***

### get()

> **get**(`documentId`): `Promise`\<[`DocumentInfo`](DocumentInfo.md)\>

Fetch document metadata from the server.

#### Parameters

##### documentId

`string`

The unique identifier of the document to fetch

#### Returns

`Promise`\<[`DocumentInfo`](DocumentInfo.md)\>

***

### getAwarenessStates()

> **getAwarenessStates**(`documentId`): `Map`\<`string`, `any`\>

Get all current awareness states for a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document to get awareness states from

#### Returns

`Map`\<`string`, `any`\>

***

### getDocumentPermission()

> **getDocumentPermission**(`documentId`): `"owner"` \| `"read-write"` \| `"reader"` \| `"admin"` \| `null`

Get the current user's permission level for a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document to check permissions for

#### Returns

`"owner"` \| `"read-write"` \| `"reader"` \| `"admin"` \| `null`

***

### getInvitation()

> **getInvitation**(`documentId`, `email`): `Promise`\<[`DocumentInvitation`](DocumentInvitation.md) \| `null`\>

Get a specific invitation for a document by email address.

#### Parameters

##### documentId

`string`

The unique identifier of the document to search invitations for

##### email

`string`

The email address of the invitee to look up

#### Returns

`Promise`\<[`DocumentInvitation`](DocumentInvitation.md) \| `null`\>

***

### getLocalMetadata()

> **getLocalMetadata**(`documentId`): `Promise`\<`LocalMetadataEntry` \| `null`\>

Get locally cached metadata for a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document whose local metadata to retrieve

#### Returns

`Promise`\<`LocalMetadataEntry` \| `null`\>

***

### getOrCreateWithAlias()

> **getOrCreateWithAlias**(`options`): `Promise`\<\{ `alias`: [`DocumentAliasInfo`](DocumentAliasInfo.md); `created`: `boolean`; `createdAt?`: `string`; `createdBy?`: `string`; `documentId`: `string`; `modifiedAt?`: `string`; `title?`: `string`; \}\>

Get an existing document by alias, or create a new one if the alias does not exist.

#### Parameters

##### options

`GetOrCreateWithAliasOptions`

Options for alias lookup and fallback creation

#### Returns

`Promise`\<\{ `alias`: [`DocumentAliasInfo`](DocumentAliasInfo.md); `created`: `boolean`; `createdAt?`: `string`; `createdBy?`: `string`; `documentId`: `string`; `modifiedAt?`: `string`; `title?`: `string`; \}\>

The document's `documentId`, metadata, `alias`, and a `created` flag indicating whether a new document was created

***

### getPermissions()

> **getPermissions**(`documentId`): `Promise`\<[`DocumentPermissionEntry`](DocumentPermissionEntry.md)[]\>

Get the list of user permissions for a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document whose permissions to retrieve

#### Returns

`Promise`\<[`DocumentPermissionEntry`](DocumentPermissionEntry.md)[]\>

***

### getRoot()

> **getRoot**(): `Promise`\<[`DocumentInfo`](DocumentInfo.md)\>

Get metadata for the app's root document.

#### Returns

`Promise`\<[`DocumentInfo`](DocumentInfo.md)\>

***

### getUploadConcurrency()

> **getUploadConcurrency**(): `number`

Get the current maximum number of concurrent blob uploads.

#### Returns

`number`

***

### grantGroupPermission()

> **grantGroupPermission**(`documentId`, `params`): `Promise`\<[`DocumentGroupPermissionEntry`](DocumentGroupPermissionEntry.md)\>

Grant a group permission on a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document to grant access to

##### params

`GrantGroupPermissionParams`

The group permission to grant

#### Returns

`Promise`\<[`DocumentGroupPermissionEntry`](DocumentGroupPermissionEntry.md)\>

***

### hasLocalCopy()

> **hasLocalCopy**(`documentId`): `boolean`

Check whether a document has a local copy stored on this device.

#### Parameters

##### documentId

`string`

The unique identifier of the document to check

#### Returns

`boolean`

***

### includesWrites()

> **includesWrites**(`documentId`, `timeoutMs?`): `Promise`\<`boolean`\>

Check whether the server has all of this client's writes for a document.
Performs a state vector comparison via WebSocket.
Returns false if the WebSocket is disconnected or the check times out.

#### Parameters

##### documentId

`string`

The document to check

##### timeoutMs?

`number`

Timeout in milliseconds (default 5000)

#### Returns

`Promise`\<`boolean`\>

***

### inSync()

> **inSync**(`documentId`, `timeoutMs?`): `Promise`\<`boolean`\>

Check whether the client and server have identical document state.
Returns false if the WebSocket is disconnected or the check times out.

#### Parameters

##### documentId

`string`

The document to check

##### timeoutMs?

`number`

Timeout in milliseconds (default 5000)

#### Returns

`Promise`\<`boolean`\>

***

### isOpen()

> **isOpen**(`documentId`): `boolean`

Check whether a document is currently open.

#### Parameters

##### documentId

`string`

The unique identifier of the document to check

#### Returns

`boolean`

***

### isPendingCreate()

> **isPendingCreate**(`documentId`): `boolean`

Check whether a document has a pending local create that has not been committed.

#### Parameters

##### documentId

`string`

The unique identifier of the document to check

#### Returns

`boolean`

***

### isReadOnly()

> **isReadOnly**(`documentId`): `boolean`

Check whether the document is read-only for the current user.

#### Parameters

##### documentId

`string`

The unique identifier of the document to check

#### Returns

`boolean`

***

### isSynced()

> **isSynced**(`documentId`): `boolean`

Check whether a document's local state is synced with the server.

#### Parameters

##### documentId

`string`

The unique identifier of the document to check sync status for

#### Returns

`boolean`

***

### list()

#### Call Signature

> **list**(`options?`): `Promise`\<[`DocumentInfo`](DocumentInfo.md)[]\>

List documents accessible to the current user with configurable loading and pagination.

##### Parameters

###### options?

`DocumentListOptions`

Controls which documents are returned, how they are loaded, and pagination

##### Returns

`Promise`\<[`DocumentInfo`](DocumentInfo.md)[]\>

#### Call Signature

> **list**(`options`): `Promise`\<`DocumentListPage`\>

List documents accessible to the current user with configurable loading and pagination.

##### Parameters

###### options

`DocumentListOptions` & `object`

Controls which documents are returned, how they are loaded, and pagination

##### Returns

`Promise`\<`DocumentListPage`\>

***

### listGroupPermissions()

> **listGroupPermissions**(`documentId`): `Promise`\<[`DocumentGroupPermissionEntry`](DocumentGroupPermissionEntry.md)[]\>

List all group-based permissions for a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document whose group permissions to list

#### Returns

`Promise`\<[`DocumentGroupPermissionEntry`](DocumentGroupPermissionEntry.md)[]\>

***

### listInvitations()

> **listInvitations**(`documentId`): `Promise`\<[`DocumentInvitation`](DocumentInvitation.md)[]\>

List all invitations for a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document whose invitations to list

#### Returns

`Promise`\<[`DocumentInvitation`](DocumentInvitation.md)[]\>

***

### listOpen()

> **listOpen**(): `string`[]

List the IDs of all currently open documents.

#### Returns

`string`[]

***

### listPendingCreates()

> **listPendingCreates**(): `Promise`\<`object`[]\>

List all documents that were created locally but not yet committed to the server.

#### Returns

`Promise`\<`object`[]\>

***

### open()

> **open**(`documentId`, `options?`): `Promise`\<\{ `doc`: `Doc` \| `null`; `metadata`: `any`; \}\>

Open a document for editing with configurable loading and sync behavior.

#### Parameters

##### documentId

`string`

The unique identifier of the document to open

##### options?

Controls how the document is loaded and synced

###### availabilityWaitMs?

`number`

Maximum time in milliseconds to wait for the document to become available from the network

###### deferNetworkSync?

`boolean`

If true, opens the document locally without starting server sync until startNetworkSync() is called

###### enableNetworkSync?

`boolean`

If false, opens the document without establishing a server connection (defaults to true)

###### retainLocalCopyAfterClose?

`boolean`

If false, evicts the local copy when the document is closed (defaults to true)

###### waitForLoad?

`"local"` \| `"network"` \| `"localIfAvailableElseNetwork"`

Controls when the returned promise resolves: "local" resolves once local data is loaded, "network" waits for server sync to complete, "localIfAvailableElseNetwork" uses local data if a copy exists or falls back to a blocking server fetch

#### Returns

`Promise`\<\{ `doc`: `Doc` \| `null`; `metadata`: `any`; \}\>

***

### openAlias()

> **openAlias**(`params`, `options?`): `Promise`\<\{ `doc`: `Doc`; `metadata`: `LocalMetadataEntry` \| `null`; \}\>

Open a document by resolving its alias first.

#### Parameters

##### params

`ResolveAliasParams`

The alias to resolve before opening

##### options?

Open options forwarded to openDocument after the alias is resolved

###### availabilityWaitMs?

`number`

###### deferNetworkSync?

`boolean`

###### enableNetworkSync?

`boolean`

###### requestSyncPerf?

`boolean`

###### retainLocal?

`boolean`

###### waitForLoad?

`"local"` \| `"network"` \| `"localIfAvailableElseNetwork"`

#### Returns

`Promise`\<\{ `doc`: `Doc`; `metadata`: `LocalMetadataEntry` \| `null`; \}\>

***

### openRoot()

> **openRoot**(): `Promise`\<`Doc`\>

Open the app's root document for editing.

#### Returns

`Promise`\<`Doc`\>

***

### pauseAllUploads()

> **pauseAllUploads**(`documentId?`): `void`

Pause all blob uploads, optionally filtered by document.

#### Parameters

##### documentId?

`string`

If provided, only pauses uploads for this document; otherwise pauses all uploads

#### Returns

`void`

***

### pauseUpload()

> **pauseUpload**(`documentId`, `blobId`): `boolean`

Pause a specific blob upload.

#### Parameters

##### documentId

`string`

The document the blob belongs to

##### blobId

`string`

The identifier of the blob upload to pause

#### Returns

`boolean`

***

### removeAwareness()

> **removeAwareness**(`documentId`, `clientIds`, `reason?`): `void`

Remove awareness states for specific clients from a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document to remove awareness from

##### clientIds

`string`[]

The client IDs whose awareness states to remove

##### reason?

`string`

An optional reason string describing why the awareness states are being removed (e.g., "timeout")

#### Returns

`void`

***

### removePermission()

> **removePermission**(`documentId`, `userId`): `Promise`\<`void`\>

Remove a user's permission from a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document to revoke access from

##### userId

`string`

The user whose permission to remove; if this is the current user, the document is also evicted locally

#### Returns

`Promise`\<`void`\>

***

### removeTag()

> **removeTag**(`documentId`, `tag`): `Promise`\<`string`[]\>

Remove a tag from a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document to untag

##### tag

`string`

The tag string to remove

#### Returns

`Promise`\<`string`[]\>

***

### resumeAllUploads()

> **resumeAllUploads**(`documentId?`): `void`

Resume all paused blob uploads, optionally filtered by document.

#### Parameters

##### documentId?

`string`

If provided, only resumes uploads for this document; otherwise resumes all uploads

#### Returns

`void`

***

### resumeUpload()

> **resumeUpload**(`documentId`, `blobId`): `boolean`

Resume a specific paused blob upload.

#### Parameters

##### documentId

`string`

The document the blob belongs to

##### blobId

`string`

The identifier of the paused blob upload to resume

#### Returns

`boolean`

***

### revokeGroupPermission()

> **revokeGroupPermission**(`documentId`, `groupType`, `groupId`): `Promise`\<\{ `success`: `boolean`; \}\>

Revoke a group's permission on a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document to revoke access from

##### groupType

`string`

The type of group whose permission to revoke

##### groupId

`string`

The identifier of the group whose permission to revoke

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### setAwareness()

> **setAwareness**(`documentId`, `state`): `void`

Set the local user's awareness state for a document (e.g., cursor position).

#### Parameters

##### documentId

`string`

The unique identifier of the document to set awareness on

##### state

`any`

The awareness state object to broadcast to other connected clients

#### Returns

`void`

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

> **transferOwnership**(`documentId`, `newOwnerId`): `Promise`\<`void`\>

Transfer document ownership to another user.

#### Parameters

##### documentId

`string`

The unique identifier of the document to transfer

##### newOwnerId

`string`

The user ID of the new owner

#### Returns

`Promise`\<`void`\>

***

### update()

> **update**(`documentId`, `data`): `Promise`\<[`DocumentInfo`](DocumentInfo.md)\>

Update document metadata such as its title.

#### Parameters

##### documentId

`string`

The unique identifier of the document to update

##### data

`UpdateDocumentData`

The document metadata fields to update

#### Returns

`Promise`\<[`DocumentInfo`](DocumentInfo.md)\>

***

### updateInvitation()

> **updateInvitation**(`documentId`, `email`, `permission`, `options?`): `Promise`\<[`DocumentInvitationResponse`](DocumentInvitationResponse.md)\>

Update an existing invitation's permission level.

#### Parameters

##### documentId

`string`

The unique identifier of the document whose invitation to update

##### email

`string`

The email address of the invitee whose permission to change

##### permission

The new permission level to grant

`"read-write"` | `"reader"`

##### options?

Optional email notification settings

###### documentUrl?

`string`

URL included in the notification email so the recipient can navigate to the document

###### note?

`string`

A personal message included in the notification email

###### sendEmail?

`boolean`

If true, sends an email notification about the updated permission

#### Returns

`Promise`\<[`DocumentInvitationResponse`](DocumentInvitationResponse.md)\>

***

### updatePermissions()

> **updatePermissions**(`documentId`, `data`): `Promise`\<`void`\>

Update user permissions on a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document to update permissions on

##### data

Single or batch permission update; provide either `userId`+`permission` for a single user, or `permissions` array for bulk updates

\{ `documentUrl?`: `string`; `note?`: `string`; `permission`: `string`; `sendEmail?`: `boolean`; `userId`: `string`; \}

Single or batch permission update; provide either `userId`+`permission` for a single user, or `permissions` array for bulk updates

###### documentUrl?

`string`

URL included in the notification email so recipients can navigate to the document

###### note?

`string`

A personal message included in the notification email

###### permission

`string`

The permission level to grant (e.g., "read-write", "reader")

###### sendEmail?

`boolean`

If true, sends an email notification to the affected user(s)

###### userId

`string`

The user whose permission to set (single-user form)

|

\{ `documentUrl?`: `string`; `note?`: `string`; `permissions`: `object`[]; `sendEmail?`: `boolean`; \}

Single or batch permission update; provide either `userId`+`permission` for a single user, or `permissions` array for bulk updates

###### documentUrl?

`string`

URL included in the notification email so recipients can navigate to the document

###### note?

`string`

A personal message included in the notification email

###### permissions

`object`[]

Array of user/permission pairs for bulk updates (batch form)

###### sendEmail?

`boolean`

If true, sends an email notification to the affected user(s)

#### Returns

`Promise`\<`void`\>

***

### uploads()

> **uploads**(`documentId?`): [`BlobUploadStatus`](BlobUploadStatus.md)[]

List active blob uploads, optionally filtered by document.

#### Parameters

##### documentId?

`string`

If provided, only returns uploads for this document; otherwise returns all uploads

#### Returns

[`BlobUploadStatus`](BlobUploadStatus.md)[]

***

### validateAccess()

> **validateAccess**(`documentId`): `Promise`\<[`DocumentAccessResult`](DocumentAccessResult.md)\>

Validate the current user's access to a document.

#### Parameters

##### documentId

`string`

The unique identifier of the document to validate access for

#### Returns

`Promise`\<[`DocumentAccessResult`](DocumentAccessResult.md)\>

***

### waitForInSync()

> **waitForInSync**(`documentId`, `timeoutMs?`, `pollMs?`): `Promise`\<`void`\>

Wait until the client and server have identical document state.

#### Parameters

##### documentId

`string`

The document to check

##### timeoutMs?

`number`

Maximum time to wait (ms, default 5000)

##### pollMs?

`number`

Polling interval (ms, default 50)

#### Returns

`Promise`\<`void`\>

***

### waitForWriteConfirmation()

> **waitForWriteConfirmation**(`documentId`, `timeoutMs?`, `pollMs?`): `Promise`\<`void`\>

Wait until the server confirms it has all of this client's writes.

#### Parameters

##### documentId

`string`

The document to check

##### timeoutMs?

`number`

Maximum time to wait (ms, default 5000)

##### pollMs?

`number`

Polling interval (ms, default 50)

#### Returns

`Promise`\<`void`\>
