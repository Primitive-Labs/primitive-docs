[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / ResourceMetadataReadResult

# Interface: ResourceMetadataReadResult

Result of a single-category metadata read (`resourceMetadata.get`). When no
row has been written yet the read still succeeds with `exists: false` and an
empty `data` object.

## Properties

### category

> **category**: `string`

***

### data

> **data**: `Record`\<`string`, `unknown`\>

The stored metadata object (`{}` when nothing has been written yet).

***

### exists

> **exists**: `boolean`

Whether a stored row exists for this resource and category.

***

### resourceId

> **resourceId**: `string`

***

### resourceType

> **resourceType**: `string`

***

### schemaVersion

> **schemaVersion**: `number` \| `null`

Schema version the stored data was validated against (`null` when `exists` is false).
