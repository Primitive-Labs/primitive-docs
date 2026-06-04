# collectionTypeConfigs — `client.collectionTypeConfigs`

Bind a rule set to a `collectionType` tag, governing access for app-defined collections. A small CRUD surface over `/collection-type-configs`.

## list()

List every collection type configuration for the current app.

::: code-group
<<< ./snippets/collection-type-configs/list.ts#example{ts} [JavaScript]
<<< ./snippets/collection-type-configs/list.swift#example{swift} [Swift]
:::

## get(collectionType)

Fetch the configuration for one collection type.

::: code-group
<<< ./snippets/collection-type-configs/get.ts#example{ts} [JavaScript]
<<< ./snippets/collection-type-configs/get.swift#example{swift} [Swift]
:::

## create(params)

Create a new collection type configuration. `collectionType` is required; `ruleSetId` is optional.

::: code-group
<<< ./snippets/collection-type-configs/create.ts#example{ts} [JavaScript]
<<< ./snippets/collection-type-configs/create.swift#example{swift} [Swift]
:::

## update(collectionType, params)

Update the configuration's rule set. Pass `null` (JS) / `.clear` (Swift) to remove the current rule set.

::: code-group
<<< ./snippets/collection-type-configs/update.ts#example{ts} [JavaScript]
<<< ./snippets/collection-type-configs/update.swift#example{swift} [Swift]
:::

## delete(collectionType)

Delete a collection type configuration.

::: code-group
<<< ./snippets/collection-type-configs/delete.ts#example{ts} [JavaScript]
<<< ./snippets/collection-type-configs/delete.swift#example{swift} [Swift]
:::
