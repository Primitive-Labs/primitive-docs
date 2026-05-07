[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / CreateDatabaseTypeConfigParams

# Interface: CreateDatabaseTypeConfigParams

## Properties

### databaseType

> **databaseType**: `string`

The database type identifier to configure (e.g., "userDB")

***

### metadataAccess?

> `optional` **metadataAccess**: `string`

Optional CEL expression gating metadata access.

***

### ruleSetId?

> `optional` **ruleSetId**: `string`

Rule set to enforce for databases of this type. Must have `resourceType: "database_type"`.

***

### triggers?

> `optional` **triggers**: `Record`\<`string`, `any`\>

Optional trigger rules keyed by model name. Validated server-side
against the schema defined in `database-type-config-controller.ts`.
