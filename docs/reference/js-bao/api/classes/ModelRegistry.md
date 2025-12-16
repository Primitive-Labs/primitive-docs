[**js-bao**](../README.md)

***

[js-bao](../globals.md) / ModelRegistry

# Class: ModelRegistry

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:22](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L22)

## Methods

### clearSessionState()

> **clearSessionState**(): `void`

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:486](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L486)

#### Returns

`void`

***

### getActiveModels()

> **getActiveModels**(): `Map`\<`string`, *typeof* [`BaseModel`](BaseModel.md)\>

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:493](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L493)

#### Returns

`Map`\<`string`, *typeof* [`BaseModel`](BaseModel.md)\>

***

### getAllRegisteredModelsInfo()

> **getAllRegisteredModelsInfo**(): `RegisteredModelInfo`[]

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:94](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L94)

#### Returns

`RegisteredModelInfo`[]

***

### getModelClass()

> **getModelClass**(`name`): *typeof* [`BaseModel`](BaseModel.md) \| `undefined`

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:72](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L72)

#### Parameters

##### name

`string`

#### Returns

*typeof* [`BaseModel`](BaseModel.md) \| `undefined`

***

### getModelInfo()

> **getModelInfo**(`modelName`): `RegisteredModelInfo` \| `undefined`

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:81](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L81)

#### Parameters

##### modelName

`string`

#### Returns

`RegisteredModelInfo` \| `undefined`

***

### getModelOptions()

> **getModelOptions**(`name`): [`ModelOptions`](../interfaces/ModelOptions.md) \| `undefined`

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:76](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L76)

#### Parameters

##### name

`string`

#### Returns

[`ModelOptions`](../interfaces/ModelOptions.md) \| `undefined`

***

### initializeAll()

> **initializeAll**(`yDoc`, `dbEngine`): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:174](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L174)

#### Parameters

##### yDoc

`Doc`

##### dbEngine

[`DatabaseEngine`](DatabaseEngine.md)

#### Returns

`Promise`\<`void`\>

***

### initializeAllForDocument()

> **initializeAllForDocument**(`yDoc`, `dbEngine`, `docId`, `permissionHint`): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:211](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L211)

#### Parameters

##### yDoc

`Doc`

##### dbEngine

[`DatabaseEngine`](DatabaseEngine.md)

##### docId

`string`

##### permissionHint

[`DocumentPermissionHint`](../type-aliases/DocumentPermissionHint.md)

#### Returns

`Promise`\<`void`\>

***

### initializeRelationships()

> **initializeRelationships**(): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:312](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L312)

#### Returns

`Promise`\<`void`\>

***

### registerModel()

> **registerModel**(`modelClass`, `options`, `fields`): `void`

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:45](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L45)

#### Parameters

##### modelClass

`any`

##### options

[`ModelOptions`](../interfaces/ModelOptions.md)

##### fields

`Map`\<`string`, [`FieldOptions`](../interfaces/FieldOptions.md)\>

#### Returns

`void`

***

### removeDocumentData()

> **removeDocumentData**(`docId`, `dbEngine`): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:268](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L268)

#### Parameters

##### docId

`string`

##### dbEngine

[`DatabaseEngine`](DatabaseEngine.md)

#### Returns

`Promise`\<`void`\>

***

### setExplicitModelsForSession()

> **setExplicitModelsForSession**(`modelClasses?`): `void`

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:113](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L113)

#### Parameters

##### modelClasses?

*typeof* [`BaseModel`](BaseModel.md)[]

#### Returns

`void`

***

### getInstance()

> `static` **getInstance**(): `ModelRegistry`

Defined in: [packages/js-bao/src/models/ModelRegistry.ts:38](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/ModelRegistry.ts#L38)

#### Returns

`ModelRegistry`
