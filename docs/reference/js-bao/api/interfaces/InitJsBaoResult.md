[**js-bao**](../README.md)

***

[js-bao](../globals.md) / InitJsBaoResult

# Interface: InitJsBaoResult

## Properties

### addDocumentModelMapping()

> **addDocumentModelMapping**: (`modelName`, `docId`) => `void`

#### Parameters

##### modelName

`string`

##### docId

`string`

#### Returns

`void`

***

### clearDefaultDocumentId()

> **clearDefaultDocumentId**: () => `void`

#### Returns

`void`

***

### clearDocumentModelMappings()

> **clearDocumentModelMappings**: () => `void`

#### Returns

`void`

***

### connectDocument()

> **connectDocument**: (`docId`, `yDoc`, `permissionHint`) => `Promise`\<`void`\>

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

### dbEngine

> **dbEngine**: [`DatabaseEngine`](../classes/DatabaseEngine.md)

***

### disconnectDocument()

> **disconnectDocument**: (`docId`) => `Promise`\<`void`\>

#### Parameters

##### docId

`string`

#### Returns

`Promise`\<`void`\>

***

### getConnectedDocuments()

> **getConnectedDocuments**: () => `Map`\<`string`, [`ConnectedDocument`](ConnectedDocument.md)\>

#### Returns

`Map`\<`string`, [`ConnectedDocument`](ConnectedDocument.md)\>

***

### getDefaultDocumentId()

> **getDefaultDocumentId**: () => `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### getDocumentIdForModel()

> **getDocumentIdForModel**: (`modelName`) => `string` \| `undefined`

#### Parameters

##### modelName

`string`

#### Returns

`string` \| `undefined`

***

### getDocumentModelMapping()

> **getDocumentModelMapping**: () => `Record`\<`string`, `string`\>

#### Returns

`Record`\<`string`, `string`\>

***

### isDocumentConnected()

> **isDocumentConnected**: (`docId`) => `boolean`

#### Parameters

##### docId

`string`

#### Returns

`boolean`

***

### modelRegistry

> **modelRegistry**: [`ModelRegistry`](../classes/ModelRegistry.md)

***

### onDefaultDocChanged()

> **onDefaultDocChanged**: (`listener`) => () => `void`

#### Parameters

##### listener

(`payload`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### onDocumentConnectionChange()

> **onDocumentConnectionChange**: (`callback`) => () => `void`

#### Parameters

##### callback

[`DocumentConnectionCallback`](../type-aliases/DocumentConnectionCallback.md)

#### Returns

> (): `void`

##### Returns

`void`

***

### onModelDocMappingChanged()

> **onModelDocMappingChanged**: (`listener`) => () => `void`

#### Parameters

##### listener

(`payload`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### removeDocumentModelMapping()

> **removeDocumentModelMapping**: (`modelName`) => `void`

#### Parameters

##### modelName

`string`

#### Returns

`void`

***

### setDefaultDocumentId()

> **setDefaultDocumentId**: (`docId`) => `void`

#### Parameters

##### docId

`string`

#### Returns

`void`
