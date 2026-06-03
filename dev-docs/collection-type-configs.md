# collectionTypeConfigs — `client.collectionTypeConfigs`

Bind a rule set to a `collectionType` tag, governing access for app-defined collections. A small CRUD surface over `/collection-type-configs`.

::: tip Divergent shape
Every method on the Swift client takes and returns untyped `[String: Any]` /
`[[String: Any]]` where JS uses the named `CollectionTypeConfigInfo`,
`CreateCollectionTypeConfigParams`, and `UpdateCollectionTypeConfigParams`
interfaces ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
`delete` resolves to a typed `{ success: boolean }` in JS but a bare dict in
Swift, and the Swift client swallows decode failures with `?? [:]` / `?? []`
(a failed cast surfaces as an empty result rather than an error). Read fields
out of the dictionary, and pass `NSNull()` where JS would pass `null`.
:::

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

Update the configuration's rule set. Pass `null` (JS) / `NSNull()` (Swift) to remove the current rule set.

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
