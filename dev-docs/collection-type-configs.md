# collectionTypeConfigs — `client.collectionTypeConfigs`

Bind a rule set to a `collectionType` tag, governing access for app-defined collections. A small CRUD surface over `/collection-type-configs`.

::: tip Now typed (Swift)
The Swift client is fully typed for this surface, mirroring JS field-for-field
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)):
`list` / `get` / `create` / `update` return `CollectionTypeConfigInfo`, `create`
and `update` take `CreateCollectionTypeConfigParams` /
`UpdateCollectionTypeConfigParams`, and `delete` returns `SuccessResult`
(`{ success }`). Decode failures now throw rather than collapsing to an empty
dict. On `update`, `ruleSetId` is a tri-state `Updatable<String>?` — omit to
leave unchanged, `.value(id)` to set, `.clear` to remove (the equivalent of
JS `null`).

The `get` / `update` / `delete` path builders now percent-encode
`collectionType` consistently with `.urlPathAllowed` and **throw**
`invalidArgument` on an unencodable tag instead of silently falling back to the
raw, unescaped value ([#596](https://github.com/Primitive-Labs/js-bao-wss/issues/596)).
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
