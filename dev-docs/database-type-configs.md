# databaseTypeConfigs — `client.databaseTypeConfigs`

Bind a rule set, CEL trigger rules, and a metadata-access gate to a `databaseType` tag. A small CRUD surface over `/databases/types`.

::: warning Swift parity gap
Every method on the Swift client takes and returns untyped `[String: Any]` /
`[[String: Any]]` where JS uses the named `DatabaseTypeConfigInfo`,
`CreateDatabaseTypeConfigParams`, and `UpdateDatabaseTypeConfigParams`
interfaces (sweep databaseTypeConfigs D1/D2,
[#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
In particular `delete` resolves to a typed `{ success: boolean }` in JS but a
bare dict in Swift, and the Swift client swallows decode failures with
`?? [:]` / `?? []` — a failed cast surfaces as an empty result rather than an
error (borders on a silent-empty bug, so check for an expected key rather than
trusting an empty dict). Read fields out of the dictionary, and pass `NSNull()`
where JS would pass `null`.
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

Update an existing configuration. Pass `null` (JS) / `NSNull()` (Swift) for any field to clear it; omit a field to leave it unchanged.

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
