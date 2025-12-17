[**js-bao**](../README.md)

***

[js-bao](../globals.md) / StringSet

# Class: StringSet

## Constructors

### Constructor

> **new StringSet**(`model`, `fieldName`, `initialValues`): `StringSet`

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

Get the number of strings in the set

##### Returns

`number`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `IterableIterator`\<`string`\>

Make the StringSet iterable

#### Returns

`IterableIterator`\<`string`\>

***

### add()

> **add**(`value`): `void`

Add a string to the set

#### Parameters

##### value

`string`

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Clear all strings from the set

#### Returns

`void`

***

### difference()

> **difference**(`other`): `StringSet`

Difference with another StringSet (values in this set but not in other)

#### Parameters

##### other

`StringSet`

#### Returns

`StringSet`

***

### has()

> **has**(`value`): `boolean`

Check if the set contains a string

#### Parameters

##### value

`string`

#### Returns

`boolean`

***

### intersection()

> **intersection**(`other`): `StringSet`

Intersection with another StringSet

#### Parameters

##### other

`StringSet`

#### Returns

`StringSet`

***

### remove()

> **remove**(`value`): `void`

Remove a string from the set

#### Parameters

##### value

`string`

#### Returns

`void`

***

### toArray()

> **toArray**(): `string`[]

Convert to array

#### Returns

`string`[]

***

### union()

> **union**(`other`): `StringSet`

Union with another StringSet

#### Parameters

##### other

`StringSet`

#### Returns

`StringSet`

***

### values()

> **values**(): `IterableIterator`\<`string`\>

Get an iterator of all values

#### Returns

`IterableIterator`\<`string`\>
