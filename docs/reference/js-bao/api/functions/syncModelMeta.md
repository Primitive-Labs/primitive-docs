[**js-bao**](../README.md)

***

[js-bao](../globals.md) / syncModelMeta

# Function: syncModelMeta()

> **syncModelMeta**(`yDoc`, `modelName`, `schema`): `void`

Sync full schema metadata into `_meta_{modelName}` inside a YDoc.

Call this inside an existing `yDoc.transact()`.  Y.Map `.set()` on
identical values is a CRDT no-op so there is no overhead after the
first write.

Skips the sync if this (yDoc, modelName) pair has already been synced
in the current session.

## Parameters

### yDoc

`Doc`

### modelName

`string`

### schema

`ModelSchemaRuntimeShape`

## Returns

`void`
