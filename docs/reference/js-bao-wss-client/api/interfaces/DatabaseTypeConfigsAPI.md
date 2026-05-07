[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DatabaseTypeConfigsAPI

# Interface: DatabaseTypeConfigsAPI

## Methods

### create()

> **create**(`params`): `Promise`\<[`DatabaseTypeConfigInfo`](DatabaseTypeConfigInfo.md)\>

Creates a new database type configuration.

#### Parameters

##### params

[`CreateDatabaseTypeConfigParams`](CreateDatabaseTypeConfigParams.md)

Configuration for the new database type

#### Returns

`Promise`\<[`DatabaseTypeConfigInfo`](DatabaseTypeConfigInfo.md)\>

***

### delete()

> **delete**(`databaseType`): `Promise`\<\{ `success`: `boolean`; \}\>

Deletes a database type configuration.

#### Parameters

##### databaseType

`string`

The database type identifier to delete

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### get()

> **get**(`databaseType`): `Promise`\<[`DatabaseTypeConfigInfo`](DatabaseTypeConfigInfo.md)\>

Retrieves the configuration for a specific database type.

#### Parameters

##### databaseType

`string`

The database type identifier to look up

#### Returns

`Promise`\<[`DatabaseTypeConfigInfo`](DatabaseTypeConfigInfo.md)\>

***

### list()

> **list**(): `Promise`\<[`DatabaseTypeConfigInfo`](DatabaseTypeConfigInfo.md)[]\>

Lists all database type configurations for the current app.

#### Returns

`Promise`\<[`DatabaseTypeConfigInfo`](DatabaseTypeConfigInfo.md)[]\>

***

### update()

> **update**(`databaseType`, `params`): `Promise`\<[`DatabaseTypeConfigInfo`](DatabaseTypeConfigInfo.md)\>

Updates an existing database type configuration.

#### Parameters

##### databaseType

`string`

The database type identifier to update

##### params

[`UpdateDatabaseTypeConfigParams`](UpdateDatabaseTypeConfigParams.md)

Fields to update on the database type configuration

#### Returns

`Promise`\<[`DatabaseTypeConfigInfo`](DatabaseTypeConfigInfo.md)\>
