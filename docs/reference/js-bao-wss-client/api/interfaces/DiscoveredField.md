[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DiscoveredField

# Interface: DiscoveredField

YDoc Schema Discovery

Reads _meta_* YMaps from a YDoc and returns a plain JSON description
of the schema.  Works with any YDoc — no BaseModel or database needed.

Usage:
  import { discoverSchema } from "js-bao";
  const schema = discoverSchema(yDoc);

## Properties

### autoAssign?

> `optional` **autoAssign**: `boolean`

***

### default?

> `optional` **default**: `string` \| `number` \| `boolean`

***

### indexed?

> `optional` **indexed**: `boolean`

***

### maxCount?

> `optional` **maxCount**: `number`

***

### maxLength?

> `optional` **maxLength**: `number`

***

### required?

> `optional` **required**: `boolean`

***

### type

> **type**: `string`

***

### unique?

> `optional` **unique**: `boolean`
