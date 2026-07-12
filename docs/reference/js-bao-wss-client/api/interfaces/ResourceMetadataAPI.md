[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / ResourceMetadataAPI

# Interface: ResourceMetadataAPI

Sub-API for reading and writing typed resource metadata (values only —
category definitions are managed by app admins, not through this client).
Reads are gated per category by its `readRule` and writes by its
`writeRule`, with an app-level owner/admin bypass; a resource-level
permission never bypasses. A denial surfaces as an HTTP 403
error on the single calls and as a per-item `ok: false` entry in the batch.

## Methods

### get()

> **get**(`resourceType`, `resourceId`, `category`): `Promise`\<[`ResourceMetadataReadResult`](ResourceMetadataReadResult.md)\>

Read one resource's metadata for one category. Succeeds with
`exists: false` and empty `data` when nothing has been written yet;
fails with 404 when the category is not defined for the resource type,
or 403 when the category's `readRule` denies the caller.

#### Parameters

##### resourceType

`string`

##### resourceId

`string`

##### category

`string`

#### Returns

`Promise`\<[`ResourceMetadataReadResult`](ResourceMetadataReadResult.md)\>

***

### getBatch()

> **getBatch**(`params`): `Promise`\<[`ResourceMetadataBatchResult`](ResourceMetadataBatchResult.md)\>

Read metadata for many resources in one call (bounded: 50 resources /
200 resource-category pairs). Partial success: per-item 403/404 errors
are returned as structured entries and do not fail the call.

#### Parameters

##### params

[`ResourceMetadataBatchParams`](ResourceMetadataBatchParams.md)

#### Returns

`Promise`\<[`ResourceMetadataBatchResult`](ResourceMetadataBatchResult.md)\>

***

### set()

> **set**(`resourceType`, `resourceId`, `category`, `data`): `Promise`\<[`ResourceMetadataWriteResult`](ResourceMetadataWriteResult.md)\>

Write (full replace) one resource's metadata for one category. The data
is validated against the category's schema; the category's `writeRule`
gates the write (403 on denial).

#### Parameters

##### resourceType

`string`

##### resourceId

`string`

##### category

`string`

##### data

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<[`ResourceMetadataWriteResult`](ResourceMetadataWriteResult.md)\>
