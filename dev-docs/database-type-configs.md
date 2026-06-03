# databaseTypeConfigs — `client.databaseTypeConfigs`

Bind a rule set, CEL trigger rules, and a metadata-access gate to a `databaseType` tag. A small CRUD surface over `/databases/types`.

::: tip Now typed (Swift)
The Swift client is now fully typed in parity with JS
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)). Every method
takes and returns named models: `DatabaseTypeConfigInfo`,
`CreateDatabaseTypeConfigParams`, `UpdateDatabaseTypeConfigParams`, and `delete`
resolves to a typed `SuccessResult` (`{ success }`). Decoding now throws on a
shape mismatch instead of swallowing it to an empty dict. To clear a field on
`update`, pass `.clear` (the typed equivalent of JS `null`); omit it to leave it
unchanged. Opaque blobs like `triggers` are `[String: JSONValue]`.
:::

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
