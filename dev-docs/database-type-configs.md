# databaseTypeConfigs — `client.databaseTypeConfigs`

Bind a rule set, CEL trigger rules, and a metadata-access gate to a `databaseType` tag. A small CRUD surface over `/databases/types`.

## list()

List every database type configuration for the current app.

::: code-group
<<< ./snippets/database-type-configs/list.ts#example{ts} [JavaScript]
<<< ./snippets/database-type-configs/list.swift#example{swift} [Swift]
:::

## get(databaseType)

Fetch the configuration for one database type.

::: code-group
<<< ./snippets/database-type-configs/get.ts#example{ts} [JavaScript]
<<< ./snippets/database-type-configs/get.swift#example{swift} [Swift]
:::

## create(params)

Create a new database type configuration. `databaseType` is required; `ruleSetId`, `triggers`, and `metadataAccess` are optional.

::: code-group
<<< ./snippets/database-type-configs/create.ts#example{ts} [JavaScript]
<<< ./snippets/database-type-configs/create.swift#example{swift} [Swift]
:::

## update(databaseType, params)

Update an existing configuration. Pass `null` (JS) / `.clear` (Swift) for any field to clear it; omit a field to leave it unchanged.

::: code-group
<<< ./snippets/database-type-configs/update.ts#example{ts} [JavaScript]
<<< ./snippets/database-type-configs/update.swift#example{swift} [Swift]
:::

## delete(databaseType)

Delete a database type configuration.

::: code-group
<<< ./snippets/database-type-configs/delete.ts#example{ts} [JavaScript]
<<< ./snippets/database-type-configs/delete.swift#example{swift} [Swift]
:::
