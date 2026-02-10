[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / StorageProvider

# Interface: StorageProvider

## Methods

### clear()

> **clear**(`store`): `Promise`\<`void`\>

Clear all entries in a store.

#### Parameters

##### store

`string`

#### Returns

`Promise`\<`void`\>

***

### close()

> **close**(): `Promise`\<`void`\>

Close the current storage connection.

#### Returns

`Promise`\<`void`\>

***

### delete()

> **delete**(`store`, `key`): `Promise`\<`void`\>

Delete a key from a store.

#### Parameters

##### store

`string`

##### key

`string`

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**\<`T`\>(`store`, `key`): `Promise`\<`StorageRecord`\<`T`\> \| `null`\>

Get a value by key from a store.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### store

`string`

##### key

`string`

#### Returns

`Promise`\<`StorageRecord`\<`T`\> \| `null`\>

***

### has()

> **has**(`store`, `key`): `Promise`\<`boolean`\>

Check if a key exists in a store.

#### Parameters

##### store

`string`

##### key

`string`

#### Returns

`Promise`\<`boolean`\>

***

### init()

> **init**(`namespace`): `Promise`\<`void`\>

Initialize the storage provider for a specific namespace.
Called when user context changes (e.g., login/logout).

#### Parameters

##### namespace

`string`

#### Returns

`Promise`\<`void`\>

***

### isReady()

> **isReady**(): `boolean`

Check if the provider is ready for operations.

#### Returns

`boolean`

***

### iterate()

> **iterate**\<`T`\>(`store`, `callback`): `Promise`\<`void`\>

Iterate over all entries in a store.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### store

`string`

##### callback

(`record`) => `void` \| `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### keys()

> **keys**(`store`): `Promise`\<`string`[]\>

Get all keys in a store.

#### Parameters

##### store

`string`

#### Returns

`Promise`\<`string`[]\>

***

### put()

> **put**\<`T`\>(`store`, `key`, `value`, `metadata?`): `Promise`\<`void`\>

Put a value into a store.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### store

`string`

##### key

`string`

##### value

`T`

##### metadata?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`void`\>
