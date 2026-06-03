# groupTypeConfigs — `client.groupTypeConfigs`

Bind a rule set and an auto-add-creator policy to a `groupType` tag (e.g. `"team"`, `"organization"`). A small CRUD surface over `/group-type-configs`.

::: tip Now typed
The Swift client mirrors the JS interfaces field-for-field: `list` / `get` /
`create` / `update` return `GroupTypeConfigInfo`, `create` takes
`CreateGroupTypeConfigParams`, `update` takes `UpdateGroupTypeConfigParams`,
and `delete` returns the typed `SuccessResult` (`{ success }`)
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)). Decode
failures now surface as thrown errors instead of being swallowed into empty
dicts. On `update`, `ruleSetId` is tri-state via `Updatable<String>`: omit to
leave unchanged, `.value("rs123")` to set, `.clear` to remove the current rule
set (where JS passes `null`). The `groupType` path segment is now
percent-encoded on `get` / `update` / `delete`, matching the JS client
([#590](https://github.com/Primitive-Labs/js-bao-wss/issues/590)).
:::

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
