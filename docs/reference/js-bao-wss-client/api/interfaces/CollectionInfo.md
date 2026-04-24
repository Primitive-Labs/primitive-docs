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

### collectionType

> **collectionType**: `string`

Controls which CollectionTypeConfig (and therefore which rule set)
applies to this collection. Defaults to `"default"` when not supplied
at create time. Immutable after create.

***

### contextId

> **contextId**: `string` \| `null`

Per-instance context identifier. Parallels `AppGroup.groupId`. Used by
CEL rules (`collection.contextId`) to identify the external entity the
collection is bound to (e.g. a class ID, project ID). `null` for
collections not bound to any context. Immutable after create.

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
