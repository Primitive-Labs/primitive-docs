[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CreateBlobBucketParams

# Interface: CreateBlobBucketParams

## Properties

### accessPolicy

> **accessPolicy**: [`BlobBucketAccessPolicy`](../type-aliases/BlobBucketAccessPolicy.md)

Access policy for blobs in this bucket

***

### bucketKey

> **bucketKey**: `string`

Human-friendly identifier for the bucket (max 64 chars, alnum + dash/underscore)

***

### description?

> `optional` **description**: `string`

Optional description

***

### name

> **name**: `string`

Display name for the bucket

***

### ruleSetId?

> `optional` **ruleSetId**: `string`

Optional rule set ID for CEL-based access control

***

### ttlTier

> **ttlTier**: [`BlobBucketTtlTier`](../type-aliases/BlobBucketTtlTier.md)

Retention tier - controls automatic expiration
