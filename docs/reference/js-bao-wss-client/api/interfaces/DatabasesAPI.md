[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DatabasesAPI

# Interface: DatabasesAPI

## Methods

### addManager()

> **addManager**(`databaseId`, `params`): `Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)\>

Add a user as a manager of a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database

##### params

[`AddManagerParams`](AddManagerParams.md)

Manager details (userId)

#### Returns

`Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)\>

***

### connect()

> **connect**(`databaseId`): `DoDb`

Connect to a database and get a DoDb instance for querying.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to connect to

#### Returns

`DoDb`

***

### create()

> **create**(`params`): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

Create a new database.

#### Parameters

##### params

`CreateDatabaseParams`

Configuration for the new database

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

***

### createOperation()

> **createOperation**(`databaseId`, `params`): `Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>

Create a new operation (query or mutation) on a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to add the operation to

##### params

`CreateOperationParams`

Operation definition

#### Returns

`Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>

***

### delete()

> **delete**(`databaseId`): `Promise`\<\{ `success`: `boolean`; \}\>

Delete a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to delete

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### deleteOperation()

> **deleteOperation**(`databaseId`, `name`): `Promise`\<\{ `success`: `boolean`; \}\>

Delete an operation from a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database containing the operation

##### name

`string`

The name of the operation to delete

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### describe()

> **describe**(`databaseId`, `modelName`): `Promise`\<`ModelFieldInfo`[]\>

Get the field schema for a model in a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to inspect

##### modelName

`string`

The name of the model whose field schema to retrieve

#### Returns

`Promise`\<`ModelFieldInfo`[]\>

***

### executeBatch()

> **executeBatch**(`databaseId`, `operationName`, `batch`): `Promise`\<\{ `failed`: `number`; `imported`: `number`; \}\>

Execute a batch of records using a named mutation operation.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to execute against

##### operationName

`string`

The name of the mutation operation to invoke for each record

##### batch

`object`[]

Array of parameter objects, each passed to the operation as a single invocation

#### Returns

`Promise`\<\{ `failed`: `number`; `imported`: `number`; \}\>

Object with `imported` and `failed` record counts

***

### executeOperation()

> **executeOperation**(`databaseId`, `name`, `options?`): `Promise`\<`any`\>

Execute a registered operation by name, with optional parameters and pagination.

#### Parameters

##### databaseId

`string`

The unique identifier of the database containing the operation

##### name

`string`

The name of the operation to execute

##### options?

`ExecuteOperationOptions`

Execution options for parameters, pagination, and diagnostics

#### Returns

`Promise`\<`any`\>

***

### get()

> **get**(`databaseId`): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

Get database info by ID.

Access is granted when the caller is an app admin, holds a direct
`DatabasePermission` (owner/manager), **or** has a matching
`DatabaseGroupPermission` via one of their group memberships.
Returns 403 "Access denied" for users whose only access is via
CEL-gated operations.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to retrieve

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

***

### getCelContext()

> **getCelContext**(`databaseId`): `Promise`\<\{ `celContext`: `Record`\<`string`, `any`\> \| `null`; `databaseId`: `string`; `metadata`: `Record`\<`string`, `any`\> \| `null`; \}\>

Read a database's CEL context dict.

Owners and managers always have access. Non-owner/manager users need a
`metadataAccess` CEL rule on the database type config.

The returned payload includes the same dict under both `metadata` (legacy
wire name) and `celContext` (new user-facing name).

#### Parameters

##### databaseId

`string`

The unique identifier of the database to read

#### Returns

`Promise`\<\{ `celContext`: `Record`\<`string`, `any`\> \| `null`; `databaseId`: `string`; `metadata`: `Record`\<`string`, `any`\> \| `null`; \}\>

***

### ~~getMetadata()~~

> **getMetadata**(`databaseId`): `Promise`\<\{ `celContext`: `Record`\<`string`, `any`\> \| `null`; `databaseId`: `string`; `metadata`: `Record`\<`string`, `any`\> \| `null`; \}\>

Read a database's CEL context dict.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to read

#### Returns

`Promise`\<\{ `celContext`: `Record`\<`string`, `any`\> \| `null`; `databaseId`: `string`; `metadata`: `Record`\<`string`, `any`\> \| `null`; \}\>

#### Deprecated

Use [getCelContext](#getcelcontext) instead.

***

### getOperation()

> **getOperation**(`databaseId`, `name`): `Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>

Get a single operation by name.

#### Parameters

##### databaseId

`string`

The unique identifier of the database containing the operation

##### name

`string`

The name of the operation to retrieve

#### Returns

`Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>

***

### grantGroupPermission()

> **grantGroupPermission**(`databaseId`, `params`): `Promise`\<[`DatabaseGroupPermissionEntry`](DatabaseGroupPermissionEntry.md)\>

Grant a group permission on a database. Members of the specified group
will gain the specified permission level on the database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to grant access to

##### params

[`GrantDatabaseGroupPermissionParams`](GrantDatabaseGroupPermissionParams.md)

The group permission to grant

#### Returns

`Promise`\<[`DatabaseGroupPermissionEntry`](DatabaseGroupPermissionEntry.md)\>

***

### ~~grantPermission()~~

> **grantPermission**(`databaseId`, `params`): `Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)\>

Grant a user permission to access a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to grant access to

##### params

[`GrantPermissionParams`](GrantPermissionParams.md)

Permission grant details

#### Returns

`Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)\>

#### Deprecated

Use [addManager](#addmanager) instead.

***

### ~~importBulk()~~

> **importBulk**(`databaseId`, `operationName`, `batch`): `Promise`\<\{ `failed`: `number`; `imported`: `number`; \}\>

#### Parameters

##### databaseId

`string`

##### operationName

`string`

##### batch

`object`[]

#### Returns

`Promise`\<\{ `failed`: `number`; `imported`: `number`; \}\>

#### Deprecated

Use executeBatch instead

***

### importCsv()

> **importCsv**(`databaseId`, `options`): `Promise`\<[`CsvImportResult`](CsvImportResult.md)\>

Import data from a CSV string into a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to import into

##### options

[`CsvImportOptions`](CsvImportOptions.md)

Import configuration (see [CsvImportOptions](CsvImportOptions.md) for full details)

#### Returns

`Promise`\<[`CsvImportResult`](CsvImportResult.md)\>

***

### list()

> **list**(`options?`): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)[]\>

List all databases the current user can access.

Returns databases where the user has any of:
- A direct `DatabasePermission` (owner or manager)
- A `DatabaseGroupPermission` matching one of the user's group memberships

App admins see every database in the app. Each entry carries a
`permission` field reflecting the highest permission level the
caller has on that database. Databases the user can only access via
CEL-gated operations are **not** included in this list.

#### Parameters

##### options?

[`ListDatabasesOptions`](ListDatabasesOptions.md)

Optional filters (e.g. `databaseType` to limit to one type)

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)[]\>

***

### listGroupPermissions()

> **listGroupPermissions**(`databaseId`, `options?`): `Promise`\<[`DatabaseGroupPermissionEntry`](DatabaseGroupPermissionEntry.md)[]\>

List all group-based permissions for a database.

By default, platform-managed internal groups (those whose `groupType` is
prefixed with `_`) are excluded. Pass `{ includeSystem: true }` to
include them (typically only useful for admin tooling).

#### Parameters

##### databaseId

`string`

The unique identifier of the database whose group
  permissions to list

##### options?

Optional list options. Set `includeSystem` to `true` to
  include platform-managed internal groups in the result.

###### includeSystem?

`boolean`

#### Returns

`Promise`\<[`DatabaseGroupPermissionEntry`](DatabaseGroupPermissionEntry.md)[]\>

***

### listOperations()

> **listOperations**(`databaseId`): `Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)[]\>

List all operations registered on a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database whose operations to list

#### Returns

`Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)[]\>

***

### listPermissions()

> **listPermissions**(`databaseId`): `Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)[]\>

List all permission entries for a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database whose permissions to list

#### Returns

`Promise`\<[`DatabasePermissionEntry`](DatabasePermissionEntry.md)[]\>

***

### removeManager()

> **removeManager**(`databaseId`, `userId`): `Promise`\<\{ `success`: `boolean`; \}\>

Remove a manager from a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database

##### userId

`string`

The user ID of the manager to remove

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### revokeGroupPermission()

> **revokeGroupPermission**(`databaseId`, `groupType`, `groupId`): `Promise`\<\{ `success`: `boolean`; \}\>

Revoke a group's permission on a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to revoke access from

##### groupType

`string`

The type of group whose permission to revoke

##### groupId

`string`

The identifier of the group whose permission to revoke

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### ~~revokePermission()~~

> **revokePermission**(`databaseId`, `userId`): `Promise`\<\{ `success`: `boolean`; \}\>

Revoke a user's permission to a database.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to revoke access from

##### userId

`string`

The user whose permission should be removed

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

#### Deprecated

Use [removeManager](#removemanager) instead.

***

### subscribe()

> **subscribe**(`databaseId`, `subscriptionKey`, `options`): () => `void`

Subscribe to real-time database changes for a server-registered
subscription (created via the `/databases/:id/subscriptions` admin
endpoint). The server filters events by the subscription's CEL
`filter` and access rule, so the callback only fires for rows the
subscriber is allowed to see.

Sends `db.subscribe` over the active WebSocket; inbound `db.change`
frames are routed back to this callback. On reconnect, the client
automatically re-issues `db.subscribe` for every active subscription
(matches the existing doc-subscription reconnect behavior).

#### Parameters

##### databaseId

`string`

The database the subscription is registered on.

##### subscriptionKey

`string`

The subscription key (admin-defined).

##### options

[`DatabaseSubscribeOptions`](DatabaseSubscribeOptions.md)

`params` forwarded to the server's filter CEL, plus
  the `onChange` callback.

#### Returns

`unsub()` — removes the callback and sends `db.unsubscribe`.

> (): `void`

##### Returns

`void`

#### Example

```ts
const unsub = client.databases.subscribe(dbId, "my-tasks", {
  params: { userId: currentUserId },
  onChange: (event) => {
    for (const change of event.changes) {
      console.log(change.op, change.id, change.data);
    }
  },
});
// Later:
unsub();
```

***

### transferOwnership()

> **transferOwnership**(`databaseId`, `newOwnerId`): `Promise`\<[`DatabaseOwnershipTransferResult`](DatabaseOwnershipTransferResult.md)\>

Transfer database ownership to another user.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to transfer

##### newOwnerId

`string`

The user ID of the new owner

#### Returns

`Promise`\<[`DatabaseOwnershipTransferResult`](DatabaseOwnershipTransferResult.md)\>

***

### update()

> **update**(`databaseId`, `params`): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

Update a database's title or type.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to update

##### params

`UpdateDatabaseParams`

Fields to update on the database

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

***

### updateCelContext()

> **updateCelContext**(`databaseId`, `celContext`): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

Update a database's CEL context dict (merge with existing).

Values set here are referenced from CEL access rules as
`database.celContext.<key>` (or legacy `database.metadata.<key>`) and
from filter JSON as `$database.celContext.<key>`.

#### Parameters

##### databaseId

`string`

The unique identifier of the database to update

##### celContext

`Record`\<`string`, `any`\>

Key-value pairs to merge into the database's existing CEL context

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

***

### ~~updateMetadata()~~

> **updateMetadata**(`databaseId`, `metadata`): `Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

Update a database's CEL context dict (merge with existing).

#### Parameters

##### databaseId

`string`

The unique identifier of the database to update

##### metadata

`Record`\<`string`, `any`\>

Key-value pairs to merge into the database's existing CEL context

#### Returns

`Promise`\<[`DatabaseInfo`](DatabaseInfo.md)\>

#### Deprecated

Use [updateCelContext](#updatecelcontext) instead.

***

### updateOperation()

> **updateOperation**(`databaseId`, `name`, `params`): `Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>

Update an existing operation's definition or access level.

#### Parameters

##### databaseId

`string`

The unique identifier of the database containing the operation

##### name

`string`

The name of the operation to update

##### params

`UpdateOperationParams`

Fields to update on the operation

#### Returns

`Promise`\<[`DatabaseOperationInfo`](DatabaseOperationInfo.md)\>
