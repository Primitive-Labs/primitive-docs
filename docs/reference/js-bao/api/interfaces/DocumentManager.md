[**js-bao**](../README.md)

***

[js-bao](../globals.md) / DocumentManager

# Interface: DocumentManager

Defined in: [packages/js-bao/src/types/documentTypes.ts:20](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/types/documentTypes.ts#L20)

## Methods

### connectDocument()

> **connectDocument**(`docId`, `yDoc`, `permissionHint`): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/types/documentTypes.ts:21](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/types/documentTypes.ts#L21)

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

Defined in: [packages/js-bao/src/types/documentTypes.ts:26](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/types/documentTypes.ts#L26)

#### Parameters

##### docId

`string`

#### Returns

`Promise`\<`void`\>

***

### getConnectedDocuments()

> **getConnectedDocuments**(): `Map`\<`string`, [`ConnectedDocument`](ConnectedDocument.md)\>

Defined in: [packages/js-bao/src/types/documentTypes.ts:27](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/types/documentTypes.ts#L27)

#### Returns

`Map`\<`string`, [`ConnectedDocument`](ConnectedDocument.md)\>

***

### isDocumentConnected()

> **isDocumentConnected**(`docId`): `boolean`

Defined in: [packages/js-bao/src/types/documentTypes.ts:28](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/types/documentTypes.ts#L28)

#### Parameters

##### docId

`string`

#### Returns

`boolean`
