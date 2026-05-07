[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / UpdateDatabaseTypeConfigParams

# Interface: UpdateDatabaseTypeConfigParams

## Properties

### metadataAccess?

> `optional` **metadataAccess**: `string` \| `null`

Replacement metadata-access CEL expression, or null to clear it.

***

### ruleSetId?

> `optional` **ruleSetId**: `string` \| `null`

New rule set ID to associate, or null to remove the current rule set

***

### triggers?

> `optional` **triggers**: `Record`\<`string`, `any`\> \| `null`

Replacement trigger rules object, or null to clear all triggers.
Server validates the structure on every update.
