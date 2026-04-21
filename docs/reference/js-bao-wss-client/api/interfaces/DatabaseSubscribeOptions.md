[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DatabaseSubscribeOptions

# Interface: DatabaseSubscribeOptions

Options for `databases.subscribe()`.

## Properties

### onChange()

> **onChange**: (`event`) => `void`

Called for every matching `db.change` frame until `unsub()` is called

#### Parameters

##### event

[`DatabaseChangePayload`](DatabaseChangePayload.md)

#### Returns

`void`

***

### params?

> `optional` **params**: `Record`\<`string`, `any`\>

Bound params passed to the server; available in filter CEL as `params.*`
