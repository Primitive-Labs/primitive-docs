# databases — `client.databases`

Create and manage databases, their CEL context, permissions, named operations,
and bulk data. Records are read and written through named **operations** —
register them with `createOperation`, then run them via `executeOperation` /
`executeBatch`.

## create(params)

Create a new database of a given type.

::: code-group
<<< ./snippets/databases/create.ts#example{ts} [JavaScript]
<<< ./snippets/databases/create.swift#example{swift} [Swift]
:::

## list(options?)

List the databases the current user can access.

The Swift `list(databaseType:)` accepts the same single-type filter as the JS
`{ databaseType }` option and returns `[DatabaseInfo]`.

::: code-group
<<< ./snippets/databases/list.ts#example{ts} [JavaScript]
<<< ./snippets/databases/list.swift#example{swift} [Swift]
:::

## get(databaseId)

Fetch one database's info by id.

::: code-group
<<< ./snippets/databases/get.ts#example{ts} [JavaScript]
<<< ./snippets/databases/get.swift#example{swift} [Swift]
:::

## update(databaseId, params)

Update a database's title or type.

::: code-group
<<< ./snippets/databases/update.ts#example{ts} [JavaScript]
<<< ./snippets/databases/update.swift#example{swift} [Swift]
:::

## delete(databaseId)

Delete a database.

::: code-group
<<< ./snippets/databases/delete.ts#example{ts} [JavaScript]
<<< ./snippets/databases/delete.swift#example{swift} [Swift]
:::

## getCelContext(databaseId)

Read a database's CEL context dict (referenced from access rules as
`database.celContext.<key>`).

::: code-group
<<< ./snippets/databases/get-cel-context.ts#example{ts} [JavaScript]
<<< ./snippets/databases/get-cel-context.swift#example{swift} [Swift]
:::

## updateCelContext(databaseId, celContext)

Merge new key-value pairs into a database's CEL context dict.

::: code-group
<<< ./snippets/databases/update-cel-context.ts#example{ts} [JavaScript]
<<< ./snippets/databases/update-cel-context.swift#example{swift} [Swift]
:::

## listPermissions(databaseId)

List all permission entries for a database.

::: code-group
<<< ./snippets/databases/list-permissions.ts#example{ts} [JavaScript]
<<< ./snippets/databases/list-permissions.swift#example{swift} [Swift]
:::

## addManager(databaseId, params)

Add a user as a manager of a database.

::: code-group
<<< ./snippets/databases/add-manager.ts#example{ts} [JavaScript]
<<< ./snippets/databases/add-manager.swift#example{swift} [Swift]
:::

## removeManager(databaseId, userId)

Remove a manager from a database.

::: code-group
<<< ./snippets/databases/remove-manager.ts#example{ts} [JavaScript]
<<< ./snippets/databases/remove-manager.swift#example{swift} [Swift]
:::

## transferOwnership(databaseId, newOwnerId)

Transfer database ownership to another user.

::: code-group
<<< ./snippets/databases/transfer-ownership.ts#example{ts} [JavaScript]
<<< ./snippets/databases/transfer-ownership.swift#example{swift} [Swift]
:::

## listGroupPermissions(databaseId, options?)

List all group-based permissions for a database.

::: code-group
<<< ./snippets/databases/list-group-permissions.ts#example{ts} [JavaScript]
<<< ./snippets/databases/list-group-permissions.swift#example{swift} [Swift]
:::

## grantGroupPermission(databaseId, params)

Grant a group permission on a database (only `"manager"` is supported).

::: code-group
<<< ./snippets/databases/grant-group-permission.ts#example{ts} [JavaScript]
<<< ./snippets/databases/grant-group-permission.swift#example{swift} [Swift]
:::

## revokeGroupPermission(databaseId, groupType, groupId)

Revoke a group's permission on a database.

::: code-group
<<< ./snippets/databases/revoke-group-permission.ts#example{ts} [JavaScript]
<<< ./snippets/databases/revoke-group-permission.swift#example{swift} [Swift]
:::

## createOperation(databaseId, params)

Create a new named operation (query or mutation) on a database.

::: code-group
<<< ./snippets/databases/create-operation.ts#example{ts} [JavaScript]
<<< ./snippets/databases/create-operation.swift#example{swift} [Swift]
:::

## listOperations(databaseId)

List all operations registered on a database.

::: code-group
<<< ./snippets/databases/list-operations.ts#example{ts} [JavaScript]
<<< ./snippets/databases/list-operations.swift#example{swift} [Swift]
:::

## getOperation(databaseId, name)

Get a single operation by name.

::: code-group
<<< ./snippets/databases/get-operation.ts#example{ts} [JavaScript]
<<< ./snippets/databases/get-operation.swift#example{swift} [Swift]
:::

## updateOperation(databaseId, name, params)

Update an existing operation's definition or access level.

::: code-group
<<< ./snippets/databases/update-operation.ts#example{ts} [JavaScript]
<<< ./snippets/databases/update-operation.swift#example{swift} [Swift]
:::

## deleteOperation(databaseId, name)

Delete an operation from a database.

::: code-group
<<< ./snippets/databases/delete-operation.ts#example{ts} [JavaScript]
<<< ./snippets/databases/delete-operation.swift#example{swift} [Swift]
:::

## executeOperation(databaseId, name, options?)

Execute a registered operation by name, with optional params and pagination.

::: code-group
<<< ./snippets/databases/execute-operation.ts#example{ts} [JavaScript]
<<< ./snippets/databases/execute-operation.swift#example{swift} [Swift]
:::

## executeBatch(databaseId, operationName, batch)

Execute a batch of records using a named mutation operation.

::: code-group
<<< ./snippets/databases/execute-batch.ts#example{ts} [JavaScript]
<<< ./snippets/databases/execute-batch.swift#example{swift} [Swift]
:::

## describe(databaseId, modelName)

Get the field schema for a model in a database.

::: code-group
<<< ./snippets/databases/describe.ts#example{ts} [JavaScript]
<<< ./snippets/databases/describe.swift#example{swift} [Swift]
:::

## connect(databaseId)

Connect to a database and get a `DoDb` for ad-hoc record query/find/save/count/aggregate.

::: warning No Swift equivalent
JavaScript-only — the Swift client has no `connect()` and no `DoDb` record
surface, so the entire ad-hoc `query` / `find` / `save` / `patch` / `count` /
`aggregate` API is absent on Swift (sweep databases D2). On Swift, read and
write records through named operations (`executeOperation` / `executeBatch`)
instead ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954),
[#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)).
:::

<<< ./snippets/databases/connect.ts#example{ts} [JavaScript]

## subscribe(databaseId, subscriptionKey, options)

Subscribe to real-time database changes for a server-registered subscription.

::: warning No Swift equivalent
JavaScript-only — the Swift client has no `subscribe()`; poll via
`executeOperation` instead
([#952](https://github.com/Primitive-Labs/js-bao-wss/issues/952)). Swift also
ships no typed `DatabaseChangeEvent` / `DatabaseChangePayload` payloads, and the
`change.changeType` (`"enter"` / `"update"` / `"leave"`) field the JS `onChange`
callback exposes is missing from the public JS type as well (sweep databases D1
/ [#949](https://github.com/Primitive-Labs/js-bao-wss/issues/949),
[#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

<<< ./snippets/databases/subscribe.ts#example{ts} [JavaScript]

## importCsv(databaseId, options)

Import data from a CSV string into a database, with column mapping, type
coercion, per-row transforms, and progress callbacks.

::: code-group
<<< ./snippets/databases/import-csv.ts#example{ts} [JavaScript]
<<< ./snippets/databases/import-csv.swift#example{swift} [Swift]
:::
