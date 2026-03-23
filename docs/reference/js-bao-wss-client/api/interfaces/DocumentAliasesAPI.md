[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DocumentAliasesAPI

# Interface: DocumentAliasesAPI

## Methods

### delete()

> **delete**(`params`): `Promise`\<`void`\>

Delete a document alias.

#### Parameters

##### params

`ResolveAliasParams`

The alias to delete

#### Returns

`Promise`\<`void`\>

***

### listForDocument()

> **listForDocument**(`documentId`): `Promise`\<[`DocumentAliasInfo`](DocumentAliasInfo.md)[]\>

List all aliases for a document.

#### Parameters

##### documentId

`string`

The document whose aliases to retrieve

#### Returns

`Promise`\<[`DocumentAliasInfo`](DocumentAliasInfo.md)[]\>

***

### resolve()

> **resolve**(`params`): `Promise`\<[`DocumentAliasInfo`](DocumentAliasInfo.md) \| `null`\>

Resolve a document alias to its document ID, returning null if not found.

#### Parameters

##### params

`ResolveAliasParams`

The alias to look up

#### Returns

`Promise`\<[`DocumentAliasInfo`](DocumentAliasInfo.md) \| `null`\>

***

### set()

> **set**(`params`): `Promise`\<[`DocumentAliasInfo`](DocumentAliasInfo.md)\>

Create or update a document alias.

#### Parameters

##### params

`SetAliasParams`

The alias configuration to create or update

#### Returns

`Promise`\<[`DocumentAliasInfo`](DocumentAliasInfo.md)\>
