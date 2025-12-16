[**js-bao**](../README.md)

***

[js-bao](../globals.md) / StringSet

# Class: StringSet

Defined in: [packages/js-bao/src/models/StringSet.ts:9](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L9)

## Constructors

### Constructor

> **new StringSet**(`model`, `fieldName`, `initialValues`): `StringSet`

Defined in: [packages/js-bao/src/models/StringSet.ts:14](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L14)

#### Parameters

##### model

`StringSetChangeTracker`

##### fieldName

`string`

##### initialValues

`string`[] = `[]`

#### Returns

`StringSet`

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [packages/js-bao/src/models/StringSet.ts:68](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L68)

Get the number of strings in the set

##### Returns

`number`

## Methods

### \_getCurrentState()

> **\_getCurrentState**(): `Set`\<`string`\>

Defined in: [packages/js-bao/src/models/StringSet.ts:134](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L134)

Get the current state including pending changes
This is used internally by the model to determine the current view

#### Returns

`Set`\<`string`\>

***

### \_updateInternalState()

> **\_updateInternalState**(`values`): `void`

Defined in: [packages/js-bao/src/models/StringSet.ts:141](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L141)

Update the internal state (used when loading from Yjs or applying changes)

#### Parameters

##### values

`string`[]

#### Returns

`void`

***

### \[iterator\]()

> **\[iterator\]**(): `IterableIterator`\<`string`\>

Defined in: [packages/js-bao/src/models/StringSet.ts:82](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L82)

Make the StringSet iterable

#### Returns

`IterableIterator`\<`string`\>

***

### add()

> **add**(`value`): `void`

Defined in: [packages/js-bao/src/models/StringSet.ts:27](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L27)

Add a string to the set

#### Parameters

##### value

`string`

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [packages/js-bao/src/models/StringSet.ts:58](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L58)

Clear all strings from the set

#### Returns

`void`

***

### difference()

> **difference**(`other`): `StringSet`

Defined in: [packages/js-bao/src/models/StringSet.ts:120](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L120)

Difference with another StringSet (values in this set but not in other)

#### Parameters

##### other

`StringSet`

#### Returns

`StringSet`

***

### has()

> **has**(`value`): `boolean`

Defined in: [packages/js-bao/src/models/StringSet.ts:51](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L51)

Check if the set contains a string

#### Parameters

##### value

`string`

#### Returns

`boolean`

***

### intersection()

> **intersection**(`other`): `StringSet`

Defined in: [packages/js-bao/src/models/StringSet.ts:107](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L107)

Intersection with another StringSet

#### Parameters

##### other

`StringSet`

#### Returns

`StringSet`

***

### remove()

> **remove**(`value`): `void`

Defined in: [packages/js-bao/src/models/StringSet.ts:41](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L41)

Remove a string from the set

#### Parameters

##### value

`string`

#### Returns

`void`

***

### toArray()

> **toArray**(): `string`[]

Defined in: [packages/js-bao/src/models/StringSet.ts:89](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L89)

Convert to array

#### Returns

`string`[]

***

### union()

> **union**(`other`): `StringSet`

Defined in: [packages/js-bao/src/models/StringSet.ts:96](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L96)

Union with another StringSet

#### Parameters

##### other

`StringSet`

#### Returns

`StringSet`

***

### values()

> **values**(): `IterableIterator`\<`string`\>

Defined in: [packages/js-bao/src/models/StringSet.ts:75](https://github.com/Primitive-Labs/js-bao/blob/d6b81890987ee335c8e147209b438e3cc96658ff/src/models/StringSet.ts#L75)

Get an iterator of all values

#### Returns

`IterableIterator`\<`string`\>
