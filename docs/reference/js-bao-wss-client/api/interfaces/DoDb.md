[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DoDb

# Interface: DoDb

Result of connectDoDb — provides both ad-hoc and pre-bound model access.

Ad-hoc: `db.query(User, filter)` — works with any model class.
Pre-bound: `db.User.query(filter)` — only for models passed in `models` array.

## Indexable

\[`modelName`: `string`\]: `any`

## Properties

### docId

> `readonly` **docId**: `string`

The connected document ID

***

### engine

> `readonly` **engine**: [`DOClientEngine`](DOClientEngine.md)

The underlying DO client engine

## Methods

### addToSet()

> **addToSet**(`model`, `id`, `sets`, `options?`): `Promise`\<`void`\>

#### Parameters

##### model

[`ModelIdentifier`](../type-aliases/ModelIdentifier.md)

##### id

`string`

##### sets

`Record`\<`string`, `string`[]\>

##### options?

`WriteCondition`

#### Returns

`Promise`\<`void`\>

***

### aggregate()

> **aggregate**(`model`, `options`): `Promise`\<`AggregationResult`\>

#### Parameters

##### model

[`ModelIdentifier`](../type-aliases/ModelIdentifier.md)

##### options

`AggregationOptions`

#### Returns

`Promise`\<`AggregationResult`\>

***

### batch()

> **batch**(`operations`): `Promise`\<`BatchOperationResult`[]\>

#### Parameters

##### operations

`BatchOperation`[]

#### Returns

`Promise`\<`BatchOperationResult`[]\>

***

### count()

> **count**(`model`, `filter?`): `Promise`\<`number`\>

#### Parameters

##### model

[`ModelIdentifier`](../type-aliases/ModelIdentifier.md)

##### filter?

`DocumentFilter`

#### Returns

`Promise`\<`number`\>

***

### delete()

> **delete**(`model`, `id`, `options?`): `Promise`\<`boolean`\>

#### Parameters

##### model

[`ModelIdentifier`](../type-aliases/ModelIdentifier.md)

##### id

`string`

##### options?

`WriteCondition`

#### Returns

`Promise`\<`boolean`\>

***

### describe()

> **describe**(`modelName`): `Promise`\<[`ModelFieldInfo`](ModelFieldInfo.md)[]\>

#### Parameters

##### modelName

`string`

#### Returns

`Promise`\<[`ModelFieldInfo`](ModelFieldInfo.md)[]\>

***

### dropIndex()

> **dropIndex**(`modelName`, `fieldName`): `Promise`\<`void`\>

#### Parameters

##### modelName

`string`

##### fieldName

`string`

#### Returns

`Promise`\<`void`\>

***

### dropUniqueConstraint()

> **dropUniqueConstraint**(`modelName`, `constraintName`): `Promise`\<`void`\>

#### Parameters

##### modelName

`string`

##### constraintName

`string`

#### Returns

`Promise`\<`void`\>

***

### find()

> **find**\<`T`\>(`model`, `id`): `Promise`\<`T` \| `null`\>

#### Type Parameters

##### T

`T` *extends* `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\>

#### Parameters

##### model

[`ModelIdentifier`](../type-aliases/ModelIdentifier.md)

##### id

`string`

#### Returns

`Promise`\<`T` \| `null`\>

***

### increment()

> **increment**(`model`, `id`, `fields`, `options?`): `Promise`\<`Record`\<`string`, `number`\>\>

#### Parameters

##### model

[`ModelIdentifier`](../type-aliases/ModelIdentifier.md)

##### id

`string`

##### fields

`Record`\<`string`, `number`\>

##### options?

`WriteCondition`

#### Returns

`Promise`\<`Record`\<`string`, `number`\>\>

***

### listIndexes()

> **listIndexes**(`modelName?`): `Promise`\<`IndexEntry`[]\>

#### Parameters

##### modelName?

`string`

#### Returns

`Promise`\<`IndexEntry`[]\>

***

### listUniqueConstraints()

> **listUniqueConstraints**(`modelName?`): `Promise`\<`UniqueConstraintEntry`[]\>

#### Parameters

##### modelName?

`string`

#### Returns

`Promise`\<`UniqueConstraintEntry`[]\>

***

### patch()

> **patch**(`model`, `id`, `data`, `options?`): `Promise`\<`string`\>

#### Parameters

##### model

[`ModelIdentifier`](../type-aliases/ModelIdentifier.md)

##### id

`string`

##### data

`Record`\<`string`, `any`\>

##### options?

`Record`\<`string`, `string`[]\> | `PatchOptions`

#### Returns

`Promise`\<`string`\>

***

### query()

> **query**\<`T`\>(`model`, `filter?`, `options?`): `Promise`\<`PaginatedResult`\<`T`\>\>

#### Type Parameters

##### T

`T` *extends* `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\>

#### Parameters

##### model

[`ModelIdentifier`](../type-aliases/ModelIdentifier.md)

##### filter?

`DocumentFilter`

##### options?

`QueryOptions`

#### Returns

`Promise`\<`PaginatedResult`\<`T`\>\>

***

### registerIndex()

> **registerIndex**(`modelName`, `fieldName`, `fieldType?`, `unique?`): `Promise`\<`void`\>

#### Parameters

##### modelName

`string`

##### fieldName

`string`

##### fieldType?

`string`

##### unique?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### registerUniqueConstraint()

> **registerUniqueConstraint**(`modelName`, `constraintName`, `fields`): `Promise`\<`void`\>

#### Parameters

##### modelName

`string`

##### constraintName

`string`

##### fields

`string`[]

#### Returns

`Promise`\<`void`\>

***

### removeFromSet()

> **removeFromSet**(`model`, `id`, `sets`, `options?`): `Promise`\<`void`\>

#### Parameters

##### model

[`ModelIdentifier`](../type-aliases/ModelIdentifier.md)

##### id

`string`

##### sets

`Record`\<`string`, `string`[]\>

##### options?

`WriteCondition`

#### Returns

`Promise`\<`void`\>

***

### save()

> **save**(`model`, `data`, `options?`): `Promise`\<`string`\>

#### Parameters

##### model

[`ModelIdentifier`](../type-aliases/ModelIdentifier.md)

##### data

`Record`\<`string`, `any`\>

##### options?

[`SaveOptions`](SaveOptions.md) | `Record`\<`string`, `string`[]\>

#### Returns

`Promise`\<`string`\>

***

### syncAllIndexes()

> **syncAllIndexes**(): `Promise`\<`number`\>

Sync indexes for all models passed in the `models` array at init.
Returns total number of indexes/constraints newly registered.

#### Returns

`Promise`\<`number`\>

***

### syncIndexes()

> **syncIndexes**(`modelClass`): `Promise`\<`number`\>

#### Parameters

##### modelClass

*typeof* `BaseModel`

#### Returns

`Promise`\<`number`\>
