[**js-bao**](../README.md)

***

[js-bao](../globals.md) / BaseModel

# Class: BaseModel

## Implements

- `StringSetChangeTracker`

## Constructors

### Constructor

> **new BaseModel**(`data`): `BaseModel`

#### Parameters

##### data

`Partial`\<`any`\> = `{}`

#### Returns

`BaseModel`

## Properties

### id

> **id**: `string`

***

### type

> **type**: `string`

***

### connectedDocuments

> `protected` `static` **connectedDocuments**: `Map`\<`string`, \{ `permissionHint`: [`DocumentPermissionHint`](../type-aliases/DocumentPermissionHint.md); `yDoc`: `Doc`; \}\>

***

### dbInstance

> `protected` `static` **dbInstance**: [`DatabaseEngine`](DatabaseEngine.md) \| `null` = `null`

***

### documentYMaps

> `protected` `static` **documentYMaps**: `Map`\<`string`, `YMap`\<`any`\>\>

***

### modelName?

> `static` `optional` **modelName**: `string`

## Accessors

### hasUnsavedChanges

#### Get Signature

> **get** **hasUnsavedChanges**(): `boolean`

##### Returns

`boolean`

***

### isDirty

#### Get Signature

> **get** **isDirty**(): `boolean`

##### Returns

`boolean`

## Methods

### delete()

> **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### discardChanges()

> **discardChanges**(): `void`

#### Returns

`void`

***

### getChangedFields()

> **getChangedFields**(): `string`[]

#### Returns

`string`[]

***

### getCurrentJSState()

> `protected` **getCurrentJSState**(): `Record`\<`string`, `any`\>

#### Returns

`Record`\<`string`, `any`\>

***

### getCurrentValue()

> **getCurrentValue**(`fieldKey`): `any`

#### Parameters

##### fieldKey

`string`

#### Returns

`any`

***

### getDocumentId()

> **getDocumentId**(): `string` \| `null`

Returns the document id this instance is associated with, or null if not resolved yet.

#### Returns

`string` \| `null`

***

### getOriginalValue()

> **getOriginalValue**(`fieldKey`): `any`

#### Parameters

##### fieldKey

`string`

#### Returns

`any`

***

### hasFieldChanged()

> **hasFieldChanged**(`fieldKey`): `boolean`

#### Parameters

##### fieldKey

`string`

#### Returns

`boolean`

***

### markStringSetChange()

> **markStringSetChange**(`fieldName`, `operation`, `value?`): `void`

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

#### Parameters

##### options?

[`SaveOptions`](../interfaces/SaveOptions.md)

#### Returns

`Promise`\<`void`\>

***

### toJSON()

> `protected` **toJSON**(): `Record`\<`string`, `any`\>

#### Returns

`Record`\<`string`, `any`\>

***

### validateBeforeSave()

> `protected` **validateBeforeSave**(): `void`

#### Returns

`void`

***

### validateFieldValue()

> `protected` **validateFieldValue**(`fieldKey`, `value`): `void`

#### Parameters

##### fieldKey

`string`

##### value

`any`

#### Returns

`void`

***

### aggregate()

> `static` **aggregate**\<`T`\>(`this`, `options`): `Promise`\<`AggregationResult`\>

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

#### Parameters

##### docId

`string`

#### Returns

`Promise`\<`void`\>

***

### clearGlobalDefaultDocumentId()

> `static` **clearGlobalDefaultDocumentId**(): `void`

#### Returns

`void`

***

### clearModelDefaultDocumentIds()

> `static` **clearModelDefaultDocumentIds**(): `void`

#### Returns

`void`

***

### count()

> `static` **count**(`this`, `filter`, `options?`): `Promise`\<`number`\>

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

Get the proper database table name (should match database engine naming)

#### Parameters

##### modelName

`string`

#### Returns

`string`

***

### getDocumentIdForModel()

> `static` **getDocumentIdForModel**(`modelName`): `string` \| `undefined`

#### Parameters

##### modelName

`string`

#### Returns

`string` \| `undefined`

***

### getGlobalDefaultDocumentId()

> `static` **getGlobalDefaultDocumentId**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### getLogLevel()

> `static` **getLogLevel**(): [`LogLevel`](../enumerations/LogLevel.md)

#### Returns

[`LogLevel`](../enumerations/LogLevel.md)

***

### getModelDefaultDocumentMapping()

> `static` **getModelDefaultDocumentMapping**(): `Record`\<`string`, `string`\>

#### Returns

`Record`\<`string`, `string`\>

***

### initialize()

> `static` **initialize**(`_yDoc`, `_db`): `Promise`\<`void`\>

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

Legacy migration method - no longer needed in the new multidoc architecture.
Data migration is now handled during document initialization.

#### Returns

`Promise`\<`void`\>

***

### notifyListeners()

> `protected` `static` **notifyListeners**(): `void`

#### Returns

`void`

***

### onDefaultDocChanged()

> `static` **onDefaultDocChanged**(`listener`): () => `void`

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

#### Parameters

##### modelName

`string`

#### Returns

`void`

***

### setGlobalDefaultDocumentId()

> `static` **setGlobalDefaultDocumentId**(`docId`): `void`

#### Parameters

##### docId

`string`

#### Returns

`void`

***

### setLogLevel()

> `static` **setLogLevel**(`level`): `void`

#### Parameters

##### level

[`LogLevel`](../enumerations/LogLevel.md)

#### Returns

`void`

***

### setModelDefaultDocumentId()

> `static` **setModelDefaultDocumentId**(`modelName`, `docId`): `void`

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

Execute a callback with automatic transaction handling for all modified models

#### Type Parameters

##### T

`T`

#### Parameters

##### callback

() => `T` \| `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>
