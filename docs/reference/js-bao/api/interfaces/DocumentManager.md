[**js-bao**](../README.md)

***

[js-bao](../globals.md) / DocumentManager

# Interface: DocumentManager

## Methods

### connectDocument()

> **connectDocument**(`docId`, `yDoc`, `permissionHint`): `Promise`\<`void`\>

#### Parameters

##### docId

`string`

##### yDoc

`Doc`

##### permissionHint

[`DocumentPermissionHint`](../type-aliases/DocumentPermissionHint.md)

#### Returns

`Promise`\<`void`\>

***

### disconnectDocument()

> **disconnectDocument**(`docId`): `Promise`\<`void`\>

#### Parameters

##### docId

`string`

#### Returns

`Promise`\<`void`\>

***

### getConnectedDocuments()

> **getConnectedDocuments**(): `Map`\<`string`, [`ConnectedDocument`](ConnectedDocument.md)\>

#### Returns

`Map`\<`string`, [`ConnectedDocument`](ConnectedDocument.md)\>

***

### isDocumentConnected()

> **isDocumentConnected**(`docId`): `boolean`

#### Parameters

##### docId

`string`

#### Returns

`boolean`
