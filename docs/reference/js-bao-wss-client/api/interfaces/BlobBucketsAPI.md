[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / BlobBucketsAPI

# Interface: BlobBucketsAPI

## Methods

### createBucket()

> **createBucket**(`params`): `Promise`\<[`BlobBucketInfo`](BlobBucketInfo.md)\>

Create a new blob bucket (admin/owner only).

#### Parameters

##### params

[`CreateBlobBucketParams`](CreateBlobBucketParams.md)

#### Returns

`Promise`\<[`BlobBucketInfo`](BlobBucketInfo.md)\>

***

### delete()

#### Call Signature

> **delete**(`bucketIdOrKey`, `blobId`): `Promise`\<\{ `deleted`: `boolean`; \}\>

Delete one blob (`DELETE .../blobs/:blobId`) → `{ deleted: boolean }`.
Back-compat, unchanged.

##### Parameters

###### bucketIdOrKey

`string`

###### blobId

`string`

##### Returns

`Promise`\<\{ `deleted`: `boolean`; \}\>

#### Call Signature

> **delete**(`bucketIdOrKey`, `blobIds`): `Promise`\<[`BatchBlobDeleteResult`](BatchBlobDeleteResult.md)\>

Batch delete blobs (#1455). Routes to `POST .../blobs/delete` with
`{ blobIds }`. All-or-nothing: if the bucket `delete` rule denies any id
the whole batch fails (403, nothing deleted). `deleted` counts ids processed
(input length, duplicates included). Max 500 ids; an empty array is a no-op.

A missing id is screened against the `delete` rule with `blobCreatedBy ==
null`, exactly like the single `delete(bucket, id)` path — so a missing id
and an existing-but-unauthorized id are indistinguishable (no existence
oracle). Under an open member-delete rule a missing id is a no-op, but under
a strict uploader-scoped rule (`record.blobCreatedBy == user.userId`) a
retry over already-deleted ids is DENIED. To opt into idempotent cleanup,
write a delete rule that permits gone blobs, e.g.
`record.blobCreatedBy == null || record.blobCreatedBy == user.userId`.

##### Parameters

###### bucketIdOrKey

`string`

###### blobIds

`string`[]

##### Returns

`Promise`\<[`BatchBlobDeleteResult`](BatchBlobDeleteResult.md)\>

***

### deleteBucket()

> **deleteBucket**(`bucketIdOrKey`): `Promise`\<\{ `deleted`: `boolean`; \}\>

Delete a bucket and all blobs inside it.

#### Parameters

##### bucketIdOrKey

`string`

#### Returns

`Promise`\<\{ `deleted`: `boolean`; \}\>

***

### download()

> **download**(`bucketIdOrKey`, `blobId`): `Promise`\<`ArrayBuffer`\>

Download a blob as an ArrayBuffer.

#### Parameters

##### bucketIdOrKey

`string`

##### blobId

`string`

#### Returns

`Promise`\<`ArrayBuffer`\>

***

### getBucket()

> **getBucket**(`bucketIdOrKey`): `Promise`\<[`BlobBucketInfo`](BlobBucketInfo.md)\>

Get a single bucket by its bucketId or bucketKey.

#### Parameters

##### bucketIdOrKey

`string`

#### Returns

`Promise`\<[`BlobBucketInfo`](BlobBucketInfo.md)\>

***

### getMetadata()

> **getMetadata**(`bucketIdOrKey`, `blobId`): `Promise`\<[`BlobInfo`](BlobInfo.md)\>

Get blob metadata without downloading content.

#### Parameters

##### bucketIdOrKey

`string`

##### blobId

`string`

#### Returns

`Promise`\<[`BlobInfo`](BlobInfo.md)\>

***

### getSignedUrl()

> **getSignedUrl**(`bucketIdOrKey`, `blobId`, `expiresInSeconds?`): `Promise`\<[`BlobSignedUrlResult`](BlobSignedUrlResult.md)\>

Get a time-limited signed URL that can be used to download a blob without auth.

#### Parameters

##### bucketIdOrKey

`string`

##### blobId

`string`

##### expiresInSeconds?

`number`

#### Returns

`Promise`\<[`BlobSignedUrlResult`](BlobSignedUrlResult.md)\>

***

### list()

> **list**(`bucketIdOrKey`, `options?`): `Promise`\<[`BucketBlobListResult`](BucketBlobListResult.md)\>

List blobs in a bucket. Uses R2 cursor pagination.

#### Parameters

##### bucketIdOrKey

`string`

##### options?

[`BlobListOptions`](BlobListOptions.md)

#### Returns

`Promise`\<[`BucketBlobListResult`](BucketBlobListResult.md)\>

***

### listBuckets()

> **listBuckets**(): `Promise`\<[`BlobBucketInfo`](BlobBucketInfo.md)[]\>

List all blob buckets for the current app (admin/owner only).

#### Returns

`Promise`\<[`BlobBucketInfo`](BlobBucketInfo.md)[]\>

***

### updateBucket()

> **updateBucket**(`bucketIdOrKey`, `params`): `Promise`\<[`BlobBucketInfo`](BlobBucketInfo.md)\>

Update a bucket's access without recreating it (#1020). Admin/owner only.
Change the `preset`, attach/swap/clear a custom `ruleSetId`, or edit
`name`/`description`. Setting a non-custom preset clears any rule set.

#### Parameters

##### bucketIdOrKey

`string`

##### params

[`UpdateBlobBucketParams`](UpdateBlobBucketParams.md)

#### Returns

`Promise`\<[`BlobBucketInfo`](BlobBucketInfo.md)\>

***

### upload()

> **upload**(`bucketIdOrKey`, `params`): `Promise`\<[`BucketBlobUploadResult`](BucketBlobUploadResult.md)\>

Upload a blob into a bucket. Returns metadata including the generated blobId.

#### Parameters

##### bucketIdOrKey

`string`

##### params

[`BlobUploadParams`](BlobUploadParams.md)

#### Returns

`Promise`\<[`BucketBlobUploadResult`](BucketBlobUploadResult.md)\>
