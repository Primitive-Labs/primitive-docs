[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CsvImportOptions

# Interface: CsvImportOptions

## Properties

### batchSize?

> `optional` **batchSize**: `number`

Batch size for writes (default: 5000).

***

### columnMap?

> `optional` **columnMap**: `Record`\<`string`, `string`\>

Map CSV column headers to field names (e.g. `{ "Product Name": "name" }`).

***

### csv?

> `optional` **csv**: `string`

CSV string to parse. Provide either `csv` or `data`.

***

### data?

> `optional` **data**: `Record`\<`string`, `string`\>[]

Pre-parsed rows (array of objects). Provide either `csv` or `data`.

***

### delimiter?

> `optional` **delimiter**: `string`

CSV delimiter (default: ",".)

***

### idColumn?

> `optional` **idColumn**: `string`

CSV column to use as the record ID.

***

### idGenerator()?

> `optional` **idGenerator**: (`row`, `index`) => `string`

Function to generate IDs for each row.

#### Parameters

##### row

`Record`\<`string`, `any`\>

##### index

`number`

#### Returns

`string`

***

### model?

> `optional` **model**: `any`

Model identifier — a BaseModel subclass or plain string name.

***

### modelName?

> `optional` **modelName**: `string`

Model name as a plain string (alternative to `model`).

***

### onBatchError()?

> `optional` **onBatchError**: (`error`, `batchIndex`) => `boolean` \| `void`

Called when a batch fails. Return false to abort.

#### Parameters

##### error

`Error`

##### batchIndex

`number`

#### Returns

`boolean` \| `void`

***

### onProgress()?

> `optional` **onProgress**: (`progress`) => `void`

Progress callback fired after each batch.

#### Parameters

##### progress

[`CsvImportProgress`](CsvImportProgress.md)

#### Returns

`void`

***

### operationName?

> `optional` **operationName**: `string`

Name of the registered save operation to use for import (default: "save").
The operation must accept params: { modelName, id, data }.

***

### syncIndexes?

> `optional` **syncIndexes**: `boolean`

Sync indexes from the model schema after all data is written.
Only applies when `model` is a BaseModel class (not a string).
Defaults to `true` — set to `false` to skip post-import indexing.

***

### transform()?

> `optional` **transform**: (`row`, `index`) => `Record`\<`string`, `any`\> \| `null`

Transform function called per row. Return null to skip a row.

#### Parameters

##### row

`Record`\<`string`, `any`\>

##### index

`number`

#### Returns

`Record`\<`string`, `any`\> \| `null`

***

### types?

> `optional` **types**: `Record`\<`string`, `"string"` \| `"number"` \| `"boolean"`\>

Explicit type coercion map (field name → target type).
