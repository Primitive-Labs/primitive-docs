[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / UpdateBlobBucketParams

# Interface: UpdateBlobBucketParams

## Properties

### ~~accessPolicy?~~

> `optional` **accessPolicy**: [`BlobBucketAccessPolicy`](../type-aliases/BlobBucketAccessPolicy.md)

#### Deprecated

Legacy access enum; accepted as an input alias for `preset`.

***

### description?

> `optional` **description**: `string` \| `null`

New description.

***

### name?

> `optional` **name**: `string`

New display name.

***

### preset?

> `optional` **preset**: `"public"` \| `"authenticated"` \| `"admin-only"` \| `"personal-uploads"`

New access preset (clears any attached rule set).

***

### ruleSetId?

> `optional` **ruleSetId**: `string` \| `null`

Attach/swap a custom rule set (makes the bucket `custom`).
