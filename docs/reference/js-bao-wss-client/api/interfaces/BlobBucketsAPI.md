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

> **delete**(`bucketIdOrKey`, `blobId`): `Promise`\<\{ `deleted`: `boolean`; \}\>

Delete a blob from a bucket.

#### Parameters

##### bucketIdOrKey

`string`

##### blobId

`string`

#### Returns

`Promise`\<\{ `deleted`: `boolean`; \}\>

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
