[**js-bao**](../README.md)

***

[js-bao](../globals.md) / DatabaseEngine

# Abstract Class: DatabaseEngine

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:17](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L17)

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

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:67](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L67)

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

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:59](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L59)

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

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:96](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L96)

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

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:106](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L106)

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

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:57](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L57)

Destroys the database engine instance and releases any associated resources.
This is crucial for cleanup, especially in testing environments or when the application is shutting down.

#### Returns

`Promise`\<`void`\>

***

### ensureReady()

> `abstract` **ensureReady**(): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:28](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L28)

Ensures that the database engine is fully initialized and ready for use.
For WASM-based engines, this might involve loading the WASM module.

#### Returns

`Promise`\<`void`\>

***

### getLastErrorMessage()

> `abstract` **getLastErrorMessage**(): `string` \| `undefined`

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:42](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L42)

Retrieves the last error message from the database engine, if any.

#### Returns

`string` \| `undefined`

The last error message as a string, or undefined if no error occurred.

***

### getTableName()

> **getTableName**(`_modelName`): `string`

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:110](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L110)

#### Parameters

##### \_modelName

`string`

#### Returns

`string`

***

### getTableSchema()

> `abstract` **getTableSchema**(`tableName`): `Promise`\<`any`\>

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:51](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L51)

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

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:92](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L92)

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

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:74](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L74)

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

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:36](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L36)

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

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:83](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L83)

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

Defined in: [packages/js-bao/src/engines/DatabaseEngine.ts:115](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/engines/DatabaseEngine.ts#L115)

#### Type Parameters

##### T

`T`

#### Parameters

##### \_callback

(`operations`) => `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>
