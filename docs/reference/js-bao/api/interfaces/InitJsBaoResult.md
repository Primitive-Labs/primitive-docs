[**js-bao**](../README.md)

***

[js-bao](../globals.md) / InitJsBaoResult

# Interface: InitJsBaoResult

Defined in: [packages/js-bao/src/initialize.ts:40](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L40)

## Properties

### addDocumentModelMapping()

> **addDocumentModelMapping**: (`modelName`, `docId`) => `void`

Defined in: [packages/js-bao/src/initialize.ts:55](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L55)

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

Defined in: [packages/js-bao/src/initialize.ts:59](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L59)

#### Returns

`void`

***

### clearDocumentModelMappings()

> **clearDocumentModelMappings**: () => `void`

Defined in: [packages/js-bao/src/initialize.ts:57](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L57)

#### Returns

`void`

***

### connectDocument()

> **connectDocument**: (`docId`, `yDoc`, `permissionHint`) => `Promise`\<`void`\>

Defined in: [packages/js-bao/src/initialize.ts:43](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L43)

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

Defined in: [packages/js-bao/src/initialize.ts:41](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L41)

***

### disconnectDocument()

> **disconnectDocument**: (`docId`) => `Promise`\<`void`\>

Defined in: [packages/js-bao/src/initialize.ts:48](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L48)

#### Parameters

##### docId

`string`

#### Returns

`Promise`\<`void`\>

***

### getConnectedDocuments()

> **getConnectedDocuments**: () => `Map`\<`string`, [`ConnectedDocument`](ConnectedDocument.md)\>

Defined in: [packages/js-bao/src/initialize.ts:49](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L49)

#### Returns

`Map`\<`string`, [`ConnectedDocument`](ConnectedDocument.md)\>

***

### getDefaultDocumentId()

> **getDefaultDocumentId**: () => `string` \| `undefined`

Defined in: [packages/js-bao/src/initialize.ts:62](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L62)

#### Returns

`string` \| `undefined`

***

### getDocumentIdForModel()

> **getDocumentIdForModel**: (`modelName`) => `string` \| `undefined`

Defined in: [packages/js-bao/src/initialize.ts:61](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L61)

#### Parameters

##### modelName

`string`

#### Returns

`string` \| `undefined`

***

### getDocumentModelMapping()

> **getDocumentModelMapping**: () => `Record`\<`string`, `string`\>

Defined in: [packages/js-bao/src/initialize.ts:60](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L60)

#### Returns

`Record`\<`string`, `string`\>

***

### isDocumentConnected()

> **isDocumentConnected**: (`docId`) => `boolean`

Defined in: [packages/js-bao/src/initialize.ts:50](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L50)

#### Parameters

##### docId

`string`

#### Returns

`boolean`

***

### modelRegistry

> **modelRegistry**: [`ModelRegistry`](../classes/ModelRegistry.md)

Defined in: [packages/js-bao/src/initialize.ts:42](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L42)

***

### onDefaultDocChanged()

> **onDefaultDocChanged**: (`listener`) => () => `void`

Defined in: [packages/js-bao/src/initialize.ts:63](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L63)

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

Defined in: [packages/js-bao/src/initialize.ts:51](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L51)

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

Defined in: [packages/js-bao/src/initialize.ts:66](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L66)

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

Defined in: [packages/js-bao/src/initialize.ts:56](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L56)

#### Parameters

##### modelName

`string`

#### Returns

`void`

***

### setDefaultDocumentId()

> **setDefaultDocumentId**: (`docId`) => `void`

Defined in: [packages/js-bao/src/initialize.ts:58](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/initialize.ts#L58)

#### Parameters

##### docId

`string`

#### Returns

`void`
