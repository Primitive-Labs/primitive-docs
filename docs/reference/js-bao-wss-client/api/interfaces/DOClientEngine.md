[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DOClientEngine

# Interface: DOClientEngine

## Extends

- `DatabaseEngine`

## Methods

### addToStringSet()

> **addToStringSet**(`modelName`, `id`, `sets`, `options?`): `Promise`\<`void`\>

Atomically add values to StringSet fields on a record.

#### Parameters

##### modelName

`string`

##### id

`string`

##### sets

`Record`\<`string`, `string`[]\>

##### options?

###### condition?

`DocumentFilter`

#### Returns

`Promise`\<`void`\>

***

### aggregateModel()

> **aggregateModel**(`modelName`, `options`): `Promise`\<`AggregationResult`\>

Aggregate records with groupBy and operations (count, sum, avg, min, max).

#### Parameters

##### modelName

`string`

##### options

`AggregationOptions`

#### Returns

`Promise`\<`AggregationResult`\>

***

### batchWrite()

> **batchWrite**(`operations`): `Promise`\<`BatchOperationResult`[]\>

Execute multiple save/patch/delete operations in a single request.
All operations run in a single transaction on the server.

#### Parameters

##### operations

`BatchOperation`[]

#### Returns

`Promise`\<`BatchOperationResult`[]\>

***

### countModel()

> **countModel**(`modelName`, `filter?`): `Promise`\<`number`\>

Count records matching a filter.

#### Parameters

##### modelName

`string`

##### filter?

`DocumentFilter`

#### Returns

`Promise`\<`number`\>

***

### createStringSetJunctionTable()

> **createStringSetJunctionTable**(`_modelName`, `_fieldName`): `Promise`\<`void`\>

Create StringSet junction table.
No-op in DO client mode.

#### Parameters

##### \_modelName

`string`

##### \_fieldName

`string`

#### Returns

`Promise`\<`void`\>

#### Overrides

`DatabaseEngine.createStringSetJunctionTable`

***

### createTable()

> **createTable**(`_modelName`, `_schema`, `_options`): `Promise`\<`void`\>

Create table.
No-op in DO client mode - schema is managed by the DO.

#### Parameters

##### \_modelName

`string`

##### \_schema

`Map`\<`string`, `FieldOptions`\>

##### \_options

`ModelOptions`

#### Returns

`Promise`\<`void`\>

#### Overrides

`DatabaseEngine.createTable`

***

### delete()

> **delete**(`modelName`, `id`): `Promise`\<`void`\>

Delete a record.
Delegates to deleteModel.

#### Parameters

##### modelName

`string`

##### id

`string`

#### Returns

`Promise`\<`void`\>

#### Overrides

`DatabaseEngine.delete`

***

### deleteByDocumentId()

> **deleteByDocumentId**(`_modelName`, `_docId`): `Promise`\<`void`\>

Deletes all records for a specific document from the given model table.
This is used when disconnecting a document to remove all its data.

#### Parameters

##### \_modelName

`string`

##### \_docId

`string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

`DatabaseEngine.deleteByDocumentId`

***

### deleteModel()

> **deleteModel**(`modelName`, `id`, `options?`): `Promise`\<`boolean`\>

Delete a record from the DO.

#### Parameters

##### modelName

`string`

##### id

`string`

##### options?

###### condition?

`DocumentFilter`

#### Returns

`Promise`\<`boolean`\>

***

### describe()

> **describe**(`modelName`): `Promise`\<[`ModelFieldInfo`](ModelFieldInfo.md)[]\>

Describe tracked fields for a model.

#### Parameters

##### modelName

`string`

#### Returns

`Promise`\<[`ModelFieldInfo`](ModelFieldInfo.md)[]\>

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Destroy the engine.
Nothing to clean up for the client.

#### Returns

`Promise`\<`void`\>

#### Overrides

`DatabaseEngine.destroy`

***

### dropIndex()

> **dropIndex**(`modelName`, `fieldName`): `Promise`\<`void`\>

Drop an index from a model field.

#### Parameters

##### modelName

`string`

##### fieldName

`string`

#### Returns

`Promise`\<`void`\>

***

### dropUniqueConstraint()

> **dropUniqueConstraint**(`modelName`, `constraintName`): `Promise`\<`void`\>

Drop a composite unique constraint.

#### Parameters

##### modelName

`string`

##### constraintName

`string`

#### Returns

`Promise`\<`void`\>

***

### ensureReady()

> **ensureReady**(): `Promise`\<`void`\>

Ensure the engine is ready.
For DOClient, this verifies connectivity.

#### Returns

`Promise`\<`void`\>

#### Overrides

`DatabaseEngine.ensureReady`

***

### getCurrentDocument()

> **getCurrentDocument**(): `string` \| `null`

Get the current document ID.

#### Returns

`string` \| `null`

***

### getLastErrorMessage()

> **getLastErrorMessage**(): `string` \| `undefined`

Get last error message.

#### Returns

`string` \| `undefined`

#### Overrides

`DatabaseEngine.getLastErrorMessage`

***

### getTableName()

> **getTableName**(`_modelName`): `string`

Get table name.
All models use 'records' in JSON schema.

#### Parameters

##### \_modelName

`string`

#### Returns

`string`

#### Overrides

`DatabaseEngine.getTableName`

***

### getTableSchema()

> **getTableSchema**(`_tableName`): `Promise`\<`any`\>

Get table schema.
Not directly supported - schema is managed by the DO.

#### Parameters

##### \_tableName

`string`

#### Returns

`Promise`\<`any`\>

#### Overrides

`DatabaseEngine.getTableSchema`

***

### healthCheck()

> **healthCheck**(): `Promise`\<\{ `status`: `string`; \}\>

Check if the DO is healthy.

#### Returns

`Promise`\<\{ `status`: `string`; \}\>

***

### incrementFields()

> **incrementFields**(`modelName`, `id`, `fields`, `options?`): `Promise`\<`Record`\<`string`, `number`\>\>

Atomically increment/decrement numeric fields on a record.
Returns the new values after the increment.

#### Parameters

##### modelName

`string`

##### id

`string`

##### fields

`Record`\<`string`, `number`\>

##### options?

###### condition?

`DocumentFilter`

#### Returns

`Promise`\<`Record`\<`string`, `number`\>\>

***

### insert()

> **insert**(`modelName`, `data`): `Promise`\<`void`\>

Insert a record.
Delegates to saveModel.

#### Parameters

##### modelName

`string`

##### data

`any`

#### Returns

`Promise`\<`void`\>

#### Overrides

`DatabaseEngine.insert`

***

### insertStringSetValues()

> **insertStringSetValues**(`_modelName`, `_fieldName`, `_recordId`, `_values`): `Promise`\<`void`\>

#### Parameters

##### \_modelName

`string`

##### \_fieldName

`string`

##### \_recordId

`string`

##### \_values

`string`[]

#### Returns

`Promise`\<`void`\>

#### Inherited from

`DatabaseEngine.insertStringSetValues`

***

### listIndexes()

> **listIndexes**(`modelName?`): `Promise`\<`IndexEntry`[]\>

List indexes, optionally filtered by model name.

#### Parameters

##### modelName?

`string`

#### Returns

`Promise`\<`IndexEntry`[]\>

***

### listUniqueConstraints()

> **listUniqueConstraints**(`modelName?`): `Promise`\<`UniqueConstraintEntry`[]\>

List composite unique constraints, optionally filtered by model name.

#### Parameters

##### modelName?

`string`

#### Returns

`Promise`\<`UniqueConstraintEntry`[]\>

***

### patchModel()

> **patchModel**(`modelName`, `id`, `data`, `stringSets?`, `options?`): `Promise`\<`string`\>

Patch (partial update) a record in the DO.
Only the provided fields are updated; existing fields are preserved.

#### Parameters

##### modelName

`string`

##### id

`string`

##### data

`Record`\<`string`, `any`\>

##### stringSets?

`Record`\<`string`, `string`[]\>

##### options?

###### condition?

`DocumentFilter`

#### Returns

`Promise`\<`string`\>

***

### query()

> **query**(`_sql`, `_params?`): `Promise`\<`any`[]\>

Execute raw SQL.
Not supported in DO client mode - use queryModel instead.

#### Parameters

##### \_sql

`string`

##### \_params?

`any`[]

#### Returns

`Promise`\<`any`[]\>

#### Overrides

`DatabaseEngine.query`

***

### queryModel()

> **queryModel**(`modelName`, `filter?`, `options?`): `Promise`\<`PaginatedResult`\<`Record`\<`string`, `any`\>\>\>

Query records from the DO.

#### Parameters

##### modelName

`string`

##### filter?

`DocumentFilter`

##### options?

`QueryOptions`

#### Returns

`Promise`\<`PaginatedResult`\<`Record`\<`string`, `any`\>\>\>

***

### registerIndex()

> **registerIndex**(`modelName`, `fieldName`, `fieldType?`, `unique?`): `Promise`\<`void`\>

Register an index on a model field.
Creates a SQLite index on json_extract(data_json, '$.fieldName').
Set unique=true to enforce uniqueness on this field.

#### Parameters

##### modelName

`string`

##### fieldName

`string`

##### fieldType?

`string`

##### unique?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### registerUniqueConstraint()

> **registerUniqueConstraint**(`modelName`, `constraintName`, `fields`): `Promise`\<`void`\>

Register a composite unique constraint across multiple fields.

#### Parameters

##### modelName

`string`

##### constraintName

`string`

##### fields

`string`[]

#### Returns

`Promise`\<`void`\>

***

### removeFromStringSet()

> **removeFromStringSet**(`modelName`, `id`, `sets`, `options?`): `Promise`\<`void`\>

Atomically remove values from StringSet fields on a record.

#### Parameters

##### modelName

`string`

##### id

`string`

##### sets

`Record`\<`string`, `string`[]\>

##### options?

###### condition?

`DocumentFilter`

#### Returns

`Promise`\<`void`\>

***

### removeStringSetValues()

> **removeStringSetValues**(`_modelName`, `_fieldName`, `_recordId`, `_values`): `Promise`\<`void`\>

#### Parameters

##### \_modelName

`string`

##### \_fieldName

`string`

##### \_recordId

`string`

##### \_values

`string`[]

#### Returns

`Promise`\<`void`\>

#### Inherited from

`DatabaseEngine.removeStringSetValues`

***

### saveModel()

> **saveModel**(`modelName`, `id`, `data`, `stringSets?`, `options?`): `Promise`\<`string`\>

Save a record to the DO.

#### Parameters

##### modelName

`string`

##### id

`string` | `undefined`

##### data

`Record`\<`string`, `any`\>

##### stringSets?

`Record`\<`string`, `string`[]\>

##### options?

###### condition?

`DocumentFilter`

###### ifNotExists?

`boolean`

###### upsertOn?

`string`

#### Returns

`Promise`\<`string`\>

***

### setCurrentDocument()

> **setCurrentDocument**(`docId`): `void`

Set the current document ID for subsequent operations.

#### Parameters

##### docId

`string`

#### Returns

`void`

***

### syncIndexesBatch()

> **syncIndexesBatch**(`request`): `Promise`\<`number`\>

Batch sync indexes: send all desired indexes in one request.
The DO compares against its _indexes table and registers only what's missing.
Returns the number of indexes/constraints newly registered.

#### Parameters

##### request

`SyncIndexesRequest`

#### Returns

`Promise`\<`number`\>

***

### withTransaction()

> **withTransaction**\<`T`\>(`callback`): `Promise`\<`T`\>

Transaction support.
DO client doesn't support client-side transactions.
Operations are atomic on the DO side.

#### Type Parameters

##### T

`T`

#### Parameters

##### callback

(`operations`) => `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>

#### Overrides

`DatabaseEngine.withTransaction`
