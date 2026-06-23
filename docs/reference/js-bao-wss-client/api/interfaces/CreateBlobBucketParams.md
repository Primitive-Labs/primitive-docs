[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CreateBlobBucketParams

# Interface: CreateBlobBucketParams

## Properties

### ~~accessPolicy?~~

> `optional` **accessPolicy**: [`BlobBucketAccessPolicy`](../type-aliases/BlobBucketAccessPolicy.md)

#### Deprecated

Legacy access enum (#1020); accepted as an input alias for `preset`.

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

### preset?

> `optional` **preset**: `"public"` \| `"authenticated"` \| `"admin-only"` \| `"personal-uploads"`

Access preset (#1020). One of `public` | `authenticated` | `admin-only` |
`personal-uploads`. Provide this OR a `ruleSetId` (custom). The legacy
`accessPolicy` enum is still accepted as an input alias.

***

### ruleSetId?

> `optional` **ruleSetId**: `string`

Rule set ID for CEL-based access control (makes the bucket `custom`).

***

### ttlTier

> **ttlTier**: [`BlobBucketTtlTier`](../type-aliases/BlobBucketTtlTier.md)

Retention tier - controls automatic expiration
