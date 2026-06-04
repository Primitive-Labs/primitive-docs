# groupTypeConfigs — `client.groupTypeConfigs`

Bind a rule set and an auto-add-creator policy to a `groupType` tag (e.g. `"team"`, `"organization"`). A small CRUD surface over `/group-type-configs`.

## list()

List every group type configuration for the current app.

::: code-group
<<< ./snippets/group-type-configs/list.ts#example{ts} [JavaScript]
<<< ./snippets/group-type-configs/list.swift#example{swift} [Swift]
:::

## get(groupType)

Fetch the configuration for one group type.

::: code-group
<<< ./snippets/group-type-configs/get.ts#example{ts} [JavaScript]
<<< ./snippets/group-type-configs/get.swift#example{swift} [Swift]
:::

## create(params)

Create a new group type configuration. `groupType` is required; `ruleSetId` and `autoAddCreator` (defaults to `false`) are optional.

::: code-group
<<< ./snippets/group-type-configs/create.ts#example{ts} [JavaScript]
<<< ./snippets/group-type-configs/create.swift#example{swift} [Swift]
:::

## update(groupType, params)

Update the configuration's rule set or auto-add-creator setting. Pass `null` (JS) / `.clear` (Swift) for `ruleSetId` to remove the current rule set.

::: code-group
<<< ./snippets/group-type-configs/update.ts#example{ts} [JavaScript]
<<< ./snippets/group-type-configs/update.swift#example{swift} [Swift]
:::

## delete(groupType)

Delete a group type configuration.

::: code-group
<<< ./snippets/group-type-configs/delete.ts#example{ts} [JavaScript]
<<< ./snippets/group-type-configs/delete.swift#example{swift} [Swift]
:::
