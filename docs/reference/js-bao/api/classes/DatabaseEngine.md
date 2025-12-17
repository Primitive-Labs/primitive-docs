[**js-bao**](../README.md)

***

[js-bao](../globals.md) / DatabaseEngine

# Abstract Class: DatabaseEngine

Abstract class defining the interface for database engines.
This allows for different database implementations (e.g., SQL.js, DuckDB) to be used interchangeably.

## Constructors

### Constructor

> **new DatabaseEngine**(): `DatabaseEngine`

#### Returns

`DatabaseEngine`

## Methods

### createStringSetJunctionTable()

> **createStringSetJunctionTable**(`_modelName`, `_fieldName`): `Promise`\<`void`\>

#### Parameters

##### \_modelName

`string`

##### \_fieldName

`string`

#### Returns

`Promise`\<`void`\>

***

### createTable()

> **createTable**(`_modelName`, `_schema`, `_options`): `Promise`\<`void`\>

#### Parameters

##### \_modelName

`string`

##### \_schema

`Map`\<`string`, `any`\>

##### \_options

[`ModelOptions`](../interfaces/ModelOptions.md)

#### Returns

`Promise`\<`void`\>

***

### delete()

> **delete**(`_modelName`, `_id`): `Promise`\<`void`\>

#### Parameters

##### \_modelName

`string`

##### \_id

`string`

#### Returns

`Promise`\<`void`\>

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

***

### destroy()

> `abstract` **destroy**(): `Promise`\<`void`\>

Destroys the database engine instance and releases any associated resources.
This is crucial for cleanup, especially in testing environments or when the application is shutting down.

#### Returns

`Promise`\<`void`\>

***

### ensureReady()

> `abstract` **ensureReady**(): `Promise`\<`void`\>

Ensures that the database engine is fully initialized and ready for use.
For WASM-based engines, this might involve loading the WASM module.

#### Returns

`Promise`\<`void`\>

***

### getLastErrorMessage()

> `abstract` **getLastErrorMessage**(): `string` \| `undefined`

Retrieves the last error message from the database engine, if any.

#### Returns

`string` \| `undefined`

The last error message as a string, or undefined if no error occurred.

***

### getTableName()

> **getTableName**(`_modelName`): `string`

#### Parameters

##### \_modelName

`string`

#### Returns

`string`

***

### getTableSchema()

> `abstract` **getTableSchema**(`tableName`): `Promise`\<`any`\>

Retrieves the schema for a given table.
This is useful for understanding table structure, field types, etc.
The exact return type might vary based on the database engine.

#### Parameters

##### tableName

`string`

The name of the table.

#### Returns

`Promise`\<`any`\>

A promise that resolves to the table schema information.

***

### insert()

> **insert**(`_modelName`, `_data`): `Promise`\<`void`\>

#### Parameters

##### \_modelName

`string`

##### \_data

`any`

#### Returns

`Promise`\<`void`\>

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

***

### query()

> `abstract` **query**(`sql`, `params?`): `Promise`\<`any`[]\>

Executes a SQL query against the database.

#### Parameters

##### sql

`string`

The SQL query string.

##### params?

`any`[]

Optional array of parameters for prepared statements.

#### Returns

`Promise`\<`any`[]\>

A promise that resolves to an array of query results.

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

***

### withTransaction()

> **withTransaction**\<`T`\>(`_callback`): `Promise`\<`T`\>

#### Type Parameters

##### T

`T`

#### Parameters

##### \_callback

(`operations`) => `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>
