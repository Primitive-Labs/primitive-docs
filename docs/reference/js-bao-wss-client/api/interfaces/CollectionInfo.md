[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CollectionInfo

# Interface: CollectionInfo

## Properties

### appId

> **appId**: `string`

***

### collectionId

> **collectionId**: `string`

***

### createdAt

> **createdAt**: `string`

***

### createdBy

> **createdBy**: `string`

***

### description?

> `optional` **description**: `string`

***

### documentCount

> **documentCount**: `number`

***

### modifiedAt

> **modifiedAt**: `string`

***

### name

> **name**: `string`

***

### permission?

> `optional` **permission**: `"read-write"` \| `"reader"`

Caller's direct permission on the collection.
Populated by `list()` only (not `listAll()` or `get()`).
"reader" = caller is in the `_col-reader` system group
"read-write" = caller is in the `_col-writer` system group
