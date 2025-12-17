[**js-bao**](../README.md)

***

[js-bao](../globals.md) / ModelRegistry

# Class: ModelRegistry

## Methods

### clearSessionState()

> **clearSessionState**(): `void`

#### Returns

`void`

***

### getActiveModels()

> **getActiveModels**(): `Map`\<`string`, *typeof* [`BaseModel`](BaseModel.md)\>

#### Returns

`Map`\<`string`, *typeof* [`BaseModel`](BaseModel.md)\>

***

### getAllRegisteredModelsInfo()

> **getAllRegisteredModelsInfo**(): `RegisteredModelInfo`[]

#### Returns

`RegisteredModelInfo`[]

***

### getModelClass()

> **getModelClass**(`name`): *typeof* [`BaseModel`](BaseModel.md) \| `undefined`

#### Parameters

##### name

`string`

#### Returns

*typeof* [`BaseModel`](BaseModel.md) \| `undefined`

***

### getModelInfo()

> **getModelInfo**(`modelName`): `RegisteredModelInfo` \| `undefined`

#### Parameters

##### modelName

`string`

#### Returns

`RegisteredModelInfo` \| `undefined`

***

### getModelOptions()

> **getModelOptions**(`name`): [`ModelOptions`](../interfaces/ModelOptions.md) \| `undefined`

#### Parameters

##### name

`string`

#### Returns

[`ModelOptions`](../interfaces/ModelOptions.md) \| `undefined`

***

### initializeAll()

> **initializeAll**(`yDoc`, `dbEngine`): `Promise`\<`void`\>

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

#### Returns

`Promise`\<`void`\>

***

### registerModel()

> **registerModel**(`modelClass`, `options`, `fields`): `void`

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

#### Parameters

##### modelClasses?

*typeof* [`BaseModel`](BaseModel.md)[]

#### Returns

`void`

***

### getInstance()

> `static` **getInstance**(): `ModelRegistry`

#### Returns

`ModelRegistry`
