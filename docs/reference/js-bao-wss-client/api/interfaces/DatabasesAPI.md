[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DatabasesAPI

# Interface: DatabasesAPI

## Methods

### addManager()

> **addManager**(`databaseId`, `params`): `Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)\>

Add a user as a manager of a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database

##### params

[`AddManagerParams`](AddManagerParams.md)

Manager details (userId)

#### Returns

`Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)\>

***

### connect()

> **connect**(`databaseId`): `DoDb`

Connect to a database and get a DoDb instance for querying.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to connect to

#### Returns

`DoDb`

***

### create()

> **create**(`params`): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

Create a new database.

#### Parameters

##### params

`CreateDatabaseParams`

Configuration for the new database

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

***

### createOperation()

> **createOperation**(`databaseId`, `params`): `Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>

Create a new operation (query or mutation) on a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to add the operation to

##### params

`CreateOperationParams`

Operation definition

#### Returns

`Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>

***

### delete()

> **delete**(`databaseId`): `Promise`\<\{ `success`: `boolean`; \}\>

Delete a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to delete

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### deleteOperation()

> **deleteOperation**(`databaseId`, `name`): `Promise`\<\{ `success`: `boolean`; \}\>

Delete an operation from a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database containing the operation

##### name

`string`

The name of the operation to delete

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### describe()

> **describe**(`databaseId`, `modelName`): `Promise`\<`ModelFieldInfo`[]\>

Get the field schema for a model in a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to inspect

##### modelName

`string`

The name of the model whose field schema to retrieve

#### Returns

`Promise`\<`ModelFieldInfo`[]\>

***

### executeOperation()

> **executeOperation**(`databaseId`, `name`, `options?`): `Promise`\<`any`\>

Execute a registered operation by name, with optional parameters and pagination.

#### Parameters

##### databaseId

`string`

The unique identifier of the database containing the operation

##### name

`string`

The name of the operation to execute

##### options?

`ExecuteOperationOptions`

Execution options for parameters, pagination, and diagnostics

#### Returns

`Promise`\<`any`\>

***

### get()

> **get**(`databaseId`): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

Get database info by ID.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to retrieve

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

***

### getMetadata()

> **getMetadata**(`databaseId`): `Promise`\<\{ `databaseId`: `string`; `metadata`: `Record`\<`string`, `any`\> \| `null`; \}\>

Read a database's custom metadata.
Owners and managers always have access. Non-owner/manager users
need a `metadataAccess` CEL rule on the database type config.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to read metadata from

#### Returns

`Promise`\<\{ `databaseId`: `string`; `metadata`: `Record`\<`string`, `any`\> \| `null`; \}\>

***

### getOperation()

> **getOperation**(`databaseId`, `name`): `Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>

Get a single operation by name.

#### Parameters

##### databaseId

`string`

The unique identifier of the database containing the operation

##### name

`string`

The name of the operation to retrieve

#### Returns

`Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>

***

### ~~grantPermission()~~

> **grantPermission**(`databaseId`, `params`): `Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)\>

Grant a user permission to access a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to grant access to

##### params

[`GrantPermissionParams`](GrantPermissionParams.md)

Permission grant details

#### Returns

`Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)\>

#### Deprecated

Use [addManager](#addmanager) instead.

***

### importBulk()

> **importBulk**(`databaseId`, `operationName`, `batch`): `Promise`\<\{ `failed`: `number`; `imported`: `number`; \}\>

Import a batch of records using a named mutation operation.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to import into

##### operationName

`string`

The name of the mutation operation to invoke for each record

##### batch

`object`[]

Array of parameter objects, each passed to the operation as a single invocation

#### Returns

`Promise`\<\{ `failed`: `number`; `imported`: `number`; \}\>

Object with `imported` and `failed` record counts

***

### importCsv()

> **importCsv**(`databaseId`, `options`): `Promise`\<[`CsvImportResult`](CsvImportResult.md)\>

Import data from a CSV string into a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to import into

##### options

[`CsvImportOptions`](CsvImportOptions.md)

Import configuration (see [CsvImportOptions](CsvImportOptions.md) for full details)

#### Returns

`Promise`\<[`CsvImportResult`](CsvImportResult.md)\>

***

### list()

> **list**(): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)[]\>

List all databases owned by the current user.

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)[]\>

***

### listOperations()

> **listOperations**(`databaseId`): `Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)[]\>

List all operations registered on a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database whose operations to list

#### Returns

`Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)[]\>

***

### listPermissions()

> **listPermissions**(`databaseId`): `Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)[]\>

List all permission entries for a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database whose permissions to list

#### Returns

`Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)[]\>

***

### removeManager()

> **removeManager**(`databaseId`, `userId`): `Promise`\<\{ `success`: `boolean`; \}\>

Remove a manager from a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database

##### userId

`string`

The user ID of the manager to remove

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### ~~revokePermission()~~

> **revokePermission**(`databaseId`, `userId`): `Promise`\<\{ `success`: `boolean`; \}\>

Revoke a user's permission to a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to revoke access from

##### userId

`string`

The user whose permission should be removed

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

#### Deprecated

Use [removeManager](#removemanager) instead.

***

### transferOwnership()

> **transferOwnership**(`databaseId`, `newOwnerId`): `Promise`\<[`DatabaseOwnershipTransferResult`](DatabaseOwnershipTransferResult.md)\>

Transfer database ownership to another user.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to transfer

##### newOwnerId

`string`

The user ID of the new owner

#### Returns

`Promise`\<[`DatabaseOwnershipTransferResult`](DatabaseOwnershipTransferResult.md)\>

***

### update()

> **update**(`databaseId`, `params`): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

Update a database's title or type.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to update

##### params

`UpdateDatabaseParams`

Fields to update on the database

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

***

### updateMetadata()

> **updateMetadata**(`databaseId`, `metadata`): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

Update a database's custom metadata.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to update

##### metadata

`Record`\<`string`, `any`\>

Key-value pairs to merge into the database's existing metadata

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

***

### updateOperation()

> **updateOperation**(`databaseId`, `name`, `params`): `Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>

Update an existing operation's definition or access level.

#### Parameters

##### databaseId

`string`

The unique identifier of the database containing the operation

##### name

`string`

The name of the operation to update

##### params

`UpdateOperationParams`

Fields to update on the operation

#### Returns

`Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>
