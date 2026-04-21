[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DatabaseChangeEvent

# Interface: DatabaseChangeEvent

A single change delivered on a `db.change` frame.

## Properties

### data?

> `optional` **data**: `any`

***

### id

> **id**: `string`

***

### modelName

> **modelName**: `string`

***

### op

> **op**: `"save"` \| `"patch"` \| `"delete"` \| `"increment"` \| `"addToSet"` \| `"removeFromSet"`

***

### previousData?

> `optional` **previousData**: `any`
