[**js-bao**](../README.md)

***

[js-bao](../globals.md) / syncInferredMeta

# Function: syncInferredMeta()

> **syncInferredMeta**(`yDoc`, `modelName`, `recordData`): `void`

Infer-on-write: when no schema is available, infer field types from
the record data and write minimal _meta_.

Call inside an existing `yDoc.transact()`.

## Parameters

### yDoc

`Doc`

### modelName

`string`

### recordData

`Record`\<`string`, `any`\>

## Returns

`void`
