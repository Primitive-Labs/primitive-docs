[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DatabaseTypeConfigInfo

# Interface: DatabaseTypeConfigInfo

A serialized database-type-configuration row, as returned by the
`databases/types` endpoints.

Database type configs control schema-less database behavior for documents
tagged with a particular `databaseType`: which rule set governs access,
which CEL-driven `triggers` run on writes, and how `metadataAccess` is
gated.

## Properties

### appId

> **appId**: `string`

***

### createdAt

> **createdAt**: `string`

***

### createdBy

> **createdBy**: `string`

***

### databaseType

> **databaseType**: `string`

***

### metadataAccess

> **metadataAccess**: `string` \| `null`

CEL expression evaluated to decide whether the caller can read database
metadata. `null` when not configured.

***

### modifiedAt

> **modifiedAt**: `string`

***

### ruleSetId

> **ruleSetId**: `string` \| `null`

***

### triggers

> **triggers**: `Record`\<`string`, `any`\> \| `null`

Trigger rules keyed by model name (e.g.
`{ Task: { triggers: [{ on: "create", set: { ... } }] } }`). `null`
when no triggers are configured.
