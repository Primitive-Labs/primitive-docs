[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CollectionTypeConfigsAPI

# Interface: CollectionTypeConfigsAPI

## Methods

### create()

> **create**(`params`): `Promise`\<[`CollectionTypeConfigInfo`](CollectionTypeConfigInfo.md)\>

Creates a new collection type configuration.

#### Parameters

##### params

[`CreateCollectionTypeConfigParams`](CreateCollectionTypeConfigParams.md)

Configuration for the new collection type

#### Returns

`Promise`\<[`CollectionTypeConfigInfo`](CollectionTypeConfigInfo.md)\>

***

### delete()

> **delete**(`collectionType`): `Promise`\<\{ `success`: `boolean`; \}\>

Deletes a collection type configuration.

#### Parameters

##### collectionType

`string`

The collection type identifier to delete

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### get()

> **get**(`collectionType`): `Promise`\<[`CollectionTypeConfigInfo`](CollectionTypeConfigInfo.md)\>

Retrieves the configuration for a specific collection type.

#### Parameters

##### collectionType

`string`

The collection type identifier to look up

#### Returns

`Promise`\<[`CollectionTypeConfigInfo`](CollectionTypeConfigInfo.md)\>

***

### list()

> **list**(): `Promise`\<[`CollectionTypeConfigInfo`](CollectionTypeConfigInfo.md)[]\>

Lists all collection type configurations for the current app.

#### Returns

`Promise`\<[`CollectionTypeConfigInfo`](CollectionTypeConfigInfo.md)[]\>

***

### update()

> **update**(`collectionType`, `params`): `Promise`\<[`CollectionTypeConfigInfo`](CollectionTypeConfigInfo.md)\>

Updates an existing collection type configuration's rule set.

#### Parameters

##### collectionType

`string`

The collection type identifier to update

##### params

[`UpdateCollectionTypeConfigParams`](UpdateCollectionTypeConfigParams.md)

Fields to update on the collection type configuration

#### Returns

`Promise`\<[`CollectionTypeConfigInfo`](CollectionTypeConfigInfo.md)\>
