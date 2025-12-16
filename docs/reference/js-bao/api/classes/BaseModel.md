[**js-bao**](../README.md)

***

[js-bao](../globals.md) / BaseModel

# Class: BaseModel

Defined in: [packages/js-bao/src/models/BaseModel.ts:229](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L229)

## Implements

- `StringSetChangeTracker`

## Constructors

### Constructor

> **new BaseModel**(`data`): `BaseModel`

Defined in: [packages/js-bao/src/models/BaseModel.ts:439](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L439)

#### Parameters

##### data

`Partial`\<`any`\> = `{}`

#### Returns

`BaseModel`

## Properties

### id

> **id**: `string`

Defined in: [packages/js-bao/src/models/BaseModel.ts:285](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L285)

***

### type

> **type**: `string`

Defined in: [packages/js-bao/src/models/BaseModel.ts:286](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L286)

***

### connectedDocuments

> `protected` `static` **connectedDocuments**: `Map`\<`string`, \{ `permissionHint`: [`DocumentPermissionHint`](../type-aliases/DocumentPermissionHint.md); `yDoc`: `Doc`; \}\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:259](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L259)

***

### dbInstance

> `protected` `static` **dbInstance**: [`DatabaseEngine`](DatabaseEngine.md) \| `null` = `null`

Defined in: [packages/js-bao/src/models/BaseModel.ts:256](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L256)

***

### documentYMaps

> `protected` `static` **documentYMaps**: `Map`\<`string`, `YMap`\<`any`\>\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:263](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L263)

***

### modelName?

> `static` `optional` **modelName**: `string`

Defined in: [packages/js-bao/src/models/BaseModel.ts:230](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L230)

## Accessors

### hasUnsavedChanges

#### Get Signature

> **get** **hasUnsavedChanges**(): `boolean`

Defined in: [packages/js-bao/src/models/BaseModel.ts:809](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L809)

##### Returns

`boolean`

***

### isDirty

#### Get Signature

> **get** **isDirty**(): `boolean`

Defined in: [packages/js-bao/src/models/BaseModel.ts:805](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L805)

##### Returns

`boolean`

## Methods

### \_buildUniqueKey()

> `protected` **\_buildUniqueKey**(`fields`, `data`, `modelName`, `constraintName`): `string` \| `null`

Defined in: [packages/js-bao/src/models/BaseModel.ts:1729](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L1729)

#### Parameters

##### fields

`string`[]

##### data

`Record`\<`string`, `any`\>

##### modelName

`string`

##### constraintName

`string`

#### Returns

`string` \| `null`

***

### \_deepEqual()

> `protected` **\_deepEqual**(`a`, `b`): `boolean`

Defined in: [packages/js-bao/src/models/BaseModel.ts:1678](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L1678)

Deep equality check for comparing field values

#### Parameters

##### a

`any`

##### b

`any`

#### Returns

`boolean`

***

### \_diffWithYjsData()

> `protected` **\_diffWithYjsData**(): `object`

Defined in: [packages/js-bao/src/models/BaseModel.ts:1501](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L1501)

Utility to diff current instance data against YJS nested map data
Returns object with added, modified, and removed fields

#### Returns

`object`

##### added

> **added**: `Record`\<`string`, `any`\>

##### modified

> **modified**: `Record`\<`string`, `any`\>

##### removed

> **removed**: `string`[]

***

### delete()

> **delete**(): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:2186](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2186)

#### Returns

`Promise`\<`void`\>

***

### discardChanges()

> **discardChanges**(): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:820](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L820)

#### Returns

`void`

***

### getChangedFields()

> **getChangedFields**(): `string`[]

Defined in: [packages/js-bao/src/models/BaseModel.ts:883](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L883)

#### Returns

`string`[]

***

### getCurrentJSState()

> `protected` **getCurrentJSState**(): `Record`\<`string`, `any`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:2278](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2278)

#### Returns

`Record`\<`string`, `any`\>

***

### getCurrentValue()

> **getCurrentValue**(`fieldKey`): `any`

Defined in: [packages/js-bao/src/models/BaseModel.ts:891](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L891)

#### Parameters

##### fieldKey

`string`

#### Returns

`any`

***

### getDocumentId()

> **getDocumentId**(): `string` \| `null`

Defined in: [packages/js-bao/src/models/BaseModel.ts:280](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L280)

Returns the document id this instance is associated with, or null if not resolved yet.

#### Returns

`string` \| `null`

***

### getOriginalValue()

> **getOriginalValue**(`fieldKey`): `any`

Defined in: [packages/js-bao/src/models/BaseModel.ts:887](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L887)

#### Parameters

##### fieldKey

`string`

#### Returns

`any`

***

### hasFieldChanged()

> **hasFieldChanged**(`fieldKey`): `boolean`

Defined in: [packages/js-bao/src/models/BaseModel.ts:895](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L895)

#### Parameters

##### fieldKey

`string`

#### Returns

`boolean`

***

### markStringSetChange()

> **markStringSetChange**(`fieldName`, `operation`, `value?`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:900](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L900)

#### Parameters

##### fieldName

`string`

##### operation

`"add"` | `"remove"` | `"clear"`

##### value?

`string`

#### Returns

`void`

#### Implementation of

`StringSetChangeTracker.markStringSetChange`

***

### save()

> **save**(`options?`): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:1744](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L1744)

#### Parameters

##### options?

[`SaveOptions`](../interfaces/SaveOptions.md)

#### Returns

`Promise`\<`void`\>

***

### toJSON()

> `protected` **toJSON**(): `Record`\<`string`, `any`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:2325](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2325)

#### Returns

`Record`\<`string`, `any`\>

***

### validateBeforeSave()

> `protected` **validateBeforeSave**(): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:839](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L839)

#### Returns

`void`

***

### validateFieldValue()

> `protected` **validateFieldValue**(`fieldKey`, `value`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:825](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L825)

#### Parameters

##### fieldKey

`string`

##### value

`any`

#### Returns

`void`

***

### \_buildKeyFromValues()

> `protected` `static` **\_buildKeyFromValues**(`fields`, `keyValues`, `modelName`, `constraintName`): `string` \| `null`

Defined in: [packages/js-bao/src/models/BaseModel.ts:1706](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L1706)

#### Parameters

##### fields

`string`[]

##### keyValues

`any`[]

##### modelName

`string`

##### constraintName

`string`

#### Returns

`string` \| `null`

***

### \_clearMappingsForDocId()

> `static` **\_clearMappingsForDocId**(`docId`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:381](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L381)

#### Parameters

##### docId

`string`

#### Returns

`void`

***

### aggregate()

> `static` **aggregate**\<`T`\>(`this`, `options`): `Promise`\<`AggregationResult`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:2589](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2589)

Main aggregation API - performs grouping, faceting, and statistical operations

#### Type Parameters

##### T

`T` *extends* `BaseModel`

#### Parameters

##### this

(...`args`) => `T`

##### options

`AggregationOptions`

Aggregation configuration with groupBy, operations, filter, limit, and sort

#### Returns

`Promise`\<`AggregationResult`\>

Nested object structure with aggregation results

#### Examples

```ts
// Simple facet count
const tagCounts = await Model.aggregate({
  groupBy: ['tags'],
  operations: [{ type: 'count' }]
});
// Result: { red: 15, blue: 8, green: 12 }
```

```ts
// Multi-dimensional grouping with multiple operations
const categoryStats = await Model.aggregate({
  groupBy: ['category', 'status'],
  operations: [
    { type: 'count' },
    { type: 'sum', field: 'amount' },
    { type: 'avg', field: 'score' }
  ],
  filter: { active: true },
  sort: { field: 'count', direction: 'desc' },
  limit: 10
});
```

```ts
// StringSet membership grouping
const urgentCounts = await Model.aggregate({
  groupBy: [{ field: 'tags', contains: 'urgent' }],
  operations: [{ type: 'count' }]
});
// Result: { true: 5, false: 23 }
```

***

### attachFieldAccessors()

> `static` **attachFieldAccessors**(`modelClass`, `fields`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:405](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L405)

#### Parameters

##### modelClass

*typeof* `BaseModel`

##### fields

`Map`\<`string`, [`FieldOptions`](../interfaces/FieldOptions.md)\>

#### Returns

`void`

***

### buildAggregationQuery()

> `protected` `static` **buildAggregationQuery**(`options`, `schema`, `modelName`): `AggregationQueryPlan`

Defined in: [packages/js-bao/src/models/BaseModel.ts:2700](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2700)

Build SQL query for structured aggregation

#### Parameters

##### options

`AggregationOptions`

##### schema

`any`

##### modelName

`string`

#### Returns

`AggregationQueryPlan`

***

### buildRegularAggregationQuery()

> `protected` `static` **buildRegularAggregationQuery**(`regularGroupBy`, `stringSetMemberships`, `options`, `translator`, `modelName`): `AggregationQueryPlan`

Defined in: [packages/js-bao/src/models/BaseModel.ts:2852](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2852)

Build query for regular field aggregation

#### Parameters

##### regularGroupBy

`string`[]

##### stringSetMemberships

`StringSetMembership`[]

##### options

`AggregationOptions`

##### translator

`DocumentQueryTranslator`

##### modelName

`string`

#### Returns

`AggregationQueryPlan`

***

### buildStringSetFacetQuery()

> `protected` `static` **buildStringSetFacetQuery**(`stringSetFields`, `options`, `translator`, `modelName`): `AggregationQueryPlan`

Defined in: [packages/js-bao/src/models/BaseModel.ts:2778](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2778)

Build query for StringSet facet counts

#### Parameters

##### stringSetFields

`string`[]

##### options

`AggregationOptions`

##### translator

`DocumentQueryTranslator`

##### modelName

`string`

#### Returns

`AggregationQueryPlan`

***

### cleanupDocumentData()

> `static` **cleanupDocumentData**(`docId`): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:1419](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L1419)

#### Parameters

##### docId

`string`

#### Returns

`Promise`\<`void`\>

***

### clearGlobalDefaultDocumentId()

> `static` **clearGlobalDefaultDocumentId**(): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:340](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L340)

#### Returns

`void`

***

### clearModelDefaultDocumentIds()

> `static` **clearModelDefaultDocumentIds**(): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:318](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L318)

#### Returns

`void`

***

### count()

> `static` **count**(`this`, `filter`, `options?`): `Promise`\<`number`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:3174](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L3174)

Document-style count API

#### Parameters

##### this

(...`args`) => `any`

##### filter

[`DocumentFilter`](../type-aliases/DocumentFilter.md) = `{}`

##### options?

`Pick`\<[`QueryOptions`](../interfaces/QueryOptions.md), `"documents"`\>

#### Returns

`Promise`\<`number`\>

***

### find()

> `static` **find**\<`T`\>(`this`, `id`): `Promise`\<`T` \| `null`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:2329](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2329)

#### Type Parameters

##### T

`T` *extends* `BaseModel`

#### Parameters

##### this

(...`args`) => `T`

##### id

`string`

#### Returns

`Promise`\<`T` \| `null`\>

***

### findAll()

> `static` **findAll**\<`T`\>(`this`): `Promise`\<`T`[]\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:3214](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L3214)

#### Type Parameters

##### T

`T` *extends* `BaseModel`

#### Parameters

##### this

(...`args`) => `T`

#### Returns

`Promise`\<`T`[]\>

***

### findByUnique()

> `static` **findByUnique**\<`T`\>(`this`, `constraintName`, `value`): `Promise`\<`T` \| `null`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:3297](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L3297)

#### Type Parameters

##### T

`T` *extends* `BaseModel`

#### Parameters

##### this

*typeof* `BaseModel` & (...`args`) => `T`

##### constraintName

`string`

##### value

`any`

#### Returns

`Promise`\<`T` \| `null`\>

***

### getDatabaseJunctionTableName()

> `protected` `static` **getDatabaseJunctionTableName**(`modelName`, `fieldName`): `string`

Defined in: [packages/js-bao/src/models/BaseModel.ts:2763](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2763)

Get the proper database junction table name for StringSet fields

#### Parameters

##### modelName

`string`

##### fieldName

`string`

#### Returns

`string`

***

### getDatabaseTableName()

> `protected` `static` **getDatabaseTableName**(`modelName`): `string`

Defined in: [packages/js-bao/src/models/BaseModel.ts:2755](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2755)

Get the proper database table name (should match database engine naming)

#### Parameters

##### modelName

`string`

#### Returns

`string`

***

### getDocumentIdForModel()

> `static` **getDocumentIdForModel**(`modelName`): `string` \| `undefined`

Defined in: [packages/js-bao/src/models/BaseModel.ts:354](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L354)

#### Parameters

##### modelName

`string`

#### Returns

`string` \| `undefined`

***

### getGlobalDefaultDocumentId()

> `static` **getGlobalDefaultDocumentId**(): `string` \| `undefined`

Defined in: [packages/js-bao/src/models/BaseModel.ts:358](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L358)

#### Returns

`string` \| `undefined`

***

### getLogLevel()

> `static` **getLogLevel**(): [`LogLevel`](../enumerations/LogLevel.md)

Defined in: [packages/js-bao/src/models/BaseModel.ts:293](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L293)

#### Returns

[`LogLevel`](../enumerations/LogLevel.md)

***

### getModelDefaultDocumentMapping()

> `static` **getModelDefaultDocumentMapping**(): `Record`\<`string`, `string`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:350](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L350)

#### Returns

`Record`\<`string`, `string`\>

***

### initialize()

> `static` **initialize**(`_yDoc`, `_db`): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:985](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L985)

#### Parameters

##### \_yDoc

`Doc`

##### \_db

[`DatabaseEngine`](DatabaseEngine.md)

#### Returns

`Promise`\<`void`\>

***

### initializeForDocument()

> `static` **initializeForDocument**(`yDoc`, `db`, `docId`, `permissionHint`): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:992](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L992)

#### Parameters

##### yDoc

`Doc`

##### db

[`DatabaseEngine`](DatabaseEngine.md)

##### docId

`string`

##### permissionHint

[`DocumentPermissionHint`](../type-aliases/DocumentPermissionHint.md)

#### Returns

`Promise`\<`void`\>

***

### migrateToNestedYMaps()

> `static` **migrateToNestedYMaps**(): `Promise`\<`void`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:1480](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L1480)

Legacy migration method - no longer needed in the new multidoc architecture.
Data migration is now handled during document initialization.

#### Returns

`Promise`\<`void`\>

***

### notifyListeners()

> `protected` `static` **notifyListeners**(): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:1459](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L1459)

#### Returns

`void`

***

### onDefaultDocChanged()

> `static` **onDefaultDocChanged**(`listener`): () => `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:362](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L362)

#### Parameters

##### listener

(`payload`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### onModelDocMappingChanged()

> `static` **onModelDocMappingChanged**(`listener`): () => `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:369](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L369)

#### Parameters

##### listener

(`payload`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### processAggregationResults()

> `protected` `static` **processAggregationResults**(`results`, `options`, `aliasMetadata?`): `AggregationResult`

Defined in: [packages/js-bao/src/models/BaseModel.ts:3039](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L3039)

Process aggregation results into nested structure

#### Parameters

##### results

`any`[]

##### options

`AggregationOptions`

##### aliasMetadata?

`AggregationAliasDetail`[]

#### Returns

`AggregationResult`

***

### query()

> `static` **query**\<`T`, `P`\>(`this`, `filter`, `options?`): `Promise`\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`QueryResult`](../type-aliases/QueryResult.md)\<`T`, `P`\>\>\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:2416](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L2416)

Document-style query API - returns paginated results

#### Type Parameters

##### T

`T` *extends* `BaseModel`

##### P

`P` *extends* [`ProjectionSpec`](../type-aliases/ProjectionSpec.md) \| `undefined` = `undefined`

#### Parameters

##### this

(...`args`) => `T`

##### filter

[`DocumentFilter`](../type-aliases/DocumentFilter.md) = `{}`

##### options?

[`QueryOptions`](../interfaces/QueryOptions.md) & `object`

#### Returns

`Promise`\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`QueryResult`](../type-aliases/QueryResult.md)\<`T`, `P`\>\>\>

***

### queryOne()

> `static` **queryOne**\<`T`, `P`\>(`this`, `filter`, `options?`): `Promise`\<[`QueryResult`](../type-aliases/QueryResult.md)\<`T`, `P`\> \| `null`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:3155](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L3155)

Document-style query API - returns single result or null

#### Type Parameters

##### T

`T` *extends* `BaseModel`

##### P

`P` *extends* [`ProjectionSpec`](../type-aliases/ProjectionSpec.md) \| `undefined` = `undefined`

#### Parameters

##### this

(...`args`) => `T`

##### filter

[`DocumentFilter`](../type-aliases/DocumentFilter.md) = `{}`

##### options?

`Omit`\<[`QueryOptions`](../interfaces/QueryOptions.md), `"limit"` \| `"uniqueStartKey"` \| `"direction"`\> & `object`

#### Returns

`Promise`\<[`QueryResult`](../type-aliases/QueryResult.md)\<`T`, `P`\> \| `null`\>

***

### removeModelDefaultDocumentId()

> `static` **removeModelDefaultDocumentId**(`modelName`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:308](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L308)

#### Parameters

##### modelName

`string`

#### Returns

`void`

***

### setGlobalDefaultDocumentId()

> `static` **setGlobalDefaultDocumentId**(`docId`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:330](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L330)

#### Parameters

##### docId

`string`

#### Returns

`void`

***

### setLogLevel()

> `static` **setLogLevel**(`level`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:289](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L289)

#### Parameters

##### level

[`LogLevel`](../enumerations/LogLevel.md)

#### Returns

`void`

***

### setModelDefaultDocumentId()

> `static` **setModelDefaultDocumentId**(`modelName`, `docId`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:298](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L298)

#### Parameters

##### modelName

`string`

##### docId

`string`

#### Returns

`void`

***

### setupNestedYMapObserver()

> `protected` `static` **setupNestedYMapObserver**(`recordId`, `recordYMap`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:3691](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L3691)

Sets up deep observation on a nested YMap to sync field-level changes to the database

#### Parameters

##### recordId

`string`

##### recordYMap

`YMap`\<`any`\>

#### Returns

`void`

***

### setupNestedYMapObserverForDocument()

> `protected` `static` **setupNestedYMapObserverForDocument**(`recordId`, `recordYMap`, `docId`, `permissionHint`): `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:3786](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L3786)

Sets up deep observation on a nested YMap for a specific document to sync field-level changes to the database

#### Parameters

##### recordId

`string`

##### recordYMap

`YMap`\<`any`\>

##### docId

`string`

##### permissionHint

[`DocumentPermissionHint`](../type-aliases/DocumentPermissionHint.md)

#### Returns

`void`

***

### subscribe()

> `static` **subscribe**(`callback`): () => `void`

Defined in: [packages/js-bao/src/models/BaseModel.ts:1443](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L1443)

#### Parameters

##### callback

() => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### upsertByUnique()

> `static` **upsertByUnique**\<`T`\>(`this`, `constraintName`, `uniqueLookupValue`, `dataToUpsert`, `options?`): `Promise`\<`T`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:3434](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L3434)

#### Type Parameters

##### T

`T` *extends* `BaseModel`

#### Parameters

##### this

*typeof* `BaseModel` & (...`args`) => `T`

##### constraintName

`string`

##### uniqueLookupValue

`any`

##### dataToUpsert

`Partial`\<`Omit`\<`T`, keyof BaseModel \| `"toJSON"`\>\> & `object`

##### options?

###### objectMustExist?

`boolean`

###### objectMustNotExist?

`boolean`

###### targetDocument?

`string`

#### Returns

`Promise`\<`T`\>

***

### withTransaction()

> `static` **withTransaction**\<`T`\>(`callback`): `Promise`\<`T`\>

Defined in: [packages/js-bao/src/models/BaseModel.ts:3629](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/BaseModel.ts#L3629)

Execute a callback with automatic transaction handling for all modified models

#### Type Parameters

##### T

`T`

#### Parameters

##### callback

() => `T` \| `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>
