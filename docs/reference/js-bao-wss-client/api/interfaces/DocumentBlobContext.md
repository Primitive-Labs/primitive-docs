[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DocumentBlobContext

# Interface: DocumentBlobContext

## Methods

### delete()

> **delete**(`blobId`): `Promise`\<\{ `deleted`: `boolean`; \}\>

Deletes a blob from the document by its ID.

#### Parameters

##### blobId

`string`

The unique identifier of the blob to delete

#### Returns

`Promise`\<\{ `deleted`: `boolean`; \}\>

***

### downloadUrl()

> **downloadUrl**(`blobId`, `params?`): `string`

Returns a direct download URL for a blob.

#### Parameters

##### blobId

`string`

The unique identifier of the blob

##### params?

`BlobDownloadUrlParams`

Download URL parameters

#### Returns

`string`

***

### get()

> **get**\<`T`\>(`blobId`): `Promise`\<`T`\>

Retrieves metadata for a single blob by its ID.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### blobId

`string`

The unique identifier of the blob

#### Returns

`Promise`\<`T`\>

***

### hasServiceWorkerControl()

> **hasServiceWorkerControl**(): `boolean`

Returns whether a service worker is registered and controlling blob proxy requests.

#### Returns

`boolean`

***

### list()

> **list**\<`T`\>(`params?`): `Promise`\<[`BlobListResult`](BlobListResult.md)\<`T`\>\>

Lists blobs attached to this document with optional pagination.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### params?

`BlobListParams`

Pagination parameters

#### Returns

`Promise`\<[`BlobListResult`](BlobListResult.md)\<`T`\>\>

***

### pauseAll()

> **pauseAll**(): `void`

Pauses all in-progress uploads for this document.

#### Returns

`void`

***

### pauseUpload()

> **pauseUpload**(`blobId`): `boolean`

Pauses an in-progress upload by blob ID.

#### Parameters

##### blobId

`string`

The unique identifier of the upload to pause

#### Returns

`boolean`

***

### prefetch()

> **prefetch**(`blobIds`, `options?`): `Promise`\<`void`\>

Pre-downloads multiple blobs into the local cache for offline access.

#### Parameters

##### blobIds

`string`[]

Array of blob IDs to download into the local cache

##### options?

[`BlobPrefetchOptions`](BlobPrefetchOptions.md)

Controls download concurrency, force-redownload, and disposition

#### Returns

`Promise`\<`void`\>

***

### proxyUrl()

> **proxyUrl**(`blobId`, `options?`): `string`

Returns a service-worker-proxied URL for a blob, useful for inline display.

#### Parameters

##### blobId

`string`

The unique identifier of the blob

##### options?

[`BlobProxyUrlOptions`](BlobProxyUrlOptions.md)

Controls disposition, attachment filename, and service worker warnings

#### Returns

`string`

***

### read()

> **read**(`blobId`, `options?`): `Promise`\<`string` \| `ArrayBuffer` \| `Uint8Array`\<`ArrayBufferLike`\> \| `Blob`\>

Reads blob content from the cache or server, returning it in the requested format.

#### Parameters

##### blobId

`string`

The unique identifier of the blob to read

##### options?

[`BlobReadOptions`](BlobReadOptions.md)

Controls the return format, force-redownload behavior, and disposition

#### Returns

`Promise`\<`string` \| `ArrayBuffer` \| `Uint8Array`\<`ArrayBufferLike`\> \| `Blob`\>

***

### resumeAll()

> **resumeAll**(): `void`

Resumes all paused uploads for this document.

#### Returns

`void`

***

### resumeUpload()

> **resumeUpload**(`blobId`): `boolean`

Resumes a paused upload by blob ID.

#### Parameters

##### blobId

`string`

The unique identifier of the upload to resume

#### Returns

`boolean`

***

### upload()

> **upload**(`source`, `options?`): `Promise`\<[`BlobUploadResult`](BlobUploadResult.md)\>

Uploads a blob to the document, hashing and deduplicating automatically.

#### Parameters

##### source

The file or binary data to upload

`ArrayBuffer` | `Uint8Array`\<`ArrayBufferLike`\> | `File` | `Blob`

##### options?

[`BlobUploadSourceOptions`](BlobUploadSourceOptions.md)

Controls filename, content type, hashing, disposition, and local retention

#### Returns

`Promise`\<[`BlobUploadResult`](BlobUploadResult.md)\>

***

### uploadFile()

> **uploadFile**(`source`, `options?`): `Promise`\<\{ `blobId`: `string`; `bytesTransferred?`: `number`; `numBytes`: `number`; \}\>

Uploads a file and queues it for background transfer if the upload queue is active.

#### Parameters

##### source

The file or binary data to upload

`ArrayBuffer` | `Uint8Array`\<`ArrayBufferLike`\> | `File` | `Blob`

##### options?

[`BlobUploadSourceOptions`](BlobUploadSourceOptions.md)

Controls filename, content type, hashing, disposition, and local retention

#### Returns

`Promise`\<\{ `blobId`: `string`; `bytesTransferred?`: `number`; `numBytes`: `number`; \}\>

***

### uploads()

> **uploads**(): [`BlobUploadStatus`](BlobUploadStatus.md)[]

Returns the current status of all tracked uploads for this document.

#### Returns

[`BlobUploadStatus`](BlobUploadStatus.md)[]
