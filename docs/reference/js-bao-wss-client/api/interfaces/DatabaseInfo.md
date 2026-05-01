[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DatabaseInfo

# Interface: DatabaseInfo

## Properties

### celContext

> **celContext**: `Record`\<`string`, `any`\> \| `null`

User-facing name for the CEL context dict attached to this database.
Values here are referenced from CEL access rules as
`database.celContext.<key>` (or the legacy `database.metadata.<key>`)
and from filter JSON as `$database.celContext.<key>`.

***

### createdAt

> **createdAt**: `string`

***

### createdBy

> **createdBy**: `string`

***

### databaseId

> **databaseId**: `string`

***

### databaseType

> **databaseType**: `string` \| `null`

***

### ~~metadata~~

> **metadata**: `Record`\<`string`, `any`\> \| `null`

#### Deprecated

Prefer [celContext](#celcontext). This field is the wire-level name
for the same dict; it stays for backwards compatibility with stored CEL
expressions that reference `database.metadata.<key>`.

***

### modifiedAt

> **modifiedAt**: `string`

***

### permission

> **permission**: `string` \| `null`

***

### title

> **title**: `string`
