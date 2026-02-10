[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / YjsPersistenceProvider

# Interface: YjsPersistenceProvider

Yjs Persistence Provider Interface

Compatible with y-indexeddb and y-sqlite3. Providers implementing this
interface can be used to persist Yjs documents locally.

## Properties

### synced

> **synced**: `boolean`

Whether the provider has finished loading existing data into the Y.Doc.

***

### whenSynced

> **whenSynced**: `Promise`\<`YjsPersistenceProvider`\>

Promise that resolves when the provider has finished initial sync.

## Methods

### clearData()?

> `optional` **clearData**(): `Promise`\<`void`\>

Clear all persisted data for this document.

#### Returns

`Promise`\<`void`\>

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Close the provider and release resources.

#### Returns

`Promise`\<`void`\>

***

### off()?

> `optional` **off**(`event`, `callback`): `void`

Unsubscribe from events.

#### Parameters

##### event

`"synced"`

##### callback

() => `void`

#### Returns

`void`

***

### on()

> **on**(`event`, `callback`): `void`

Subscribe to events.

#### Parameters

##### event

`"synced"`

##### callback

() => `void`

#### Returns

`void`
