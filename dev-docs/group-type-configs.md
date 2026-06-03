# groupTypeConfigs — `client.groupTypeConfigs`

Bind a rule set and an auto-add-creator policy to a `groupType` tag (e.g. `"team"`, `"organization"`). A small CRUD surface over `/group-type-configs`.

::: tip Divergent shape
Every method on the Swift client takes and returns untyped `[String: Any]` /
`[[String: Any]]` where JS uses the named `GroupTypeConfigInfo`,
`CreateGroupTypeConfigParams`, and `UpdateGroupTypeConfigParams` interfaces
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)). `delete`
resolves to a typed `{ success: boolean }` in JS but a bare dict in Swift, and
the Swift client swallows decode failures with `?? [:]` / `?? []` (a failed
cast surfaces as an empty result rather than an error). Read fields out of the
dictionary, and pass `NSNull()` where JS would pass `null`.

Additionally, the Swift client interpolates the `groupType` path segment into
the request URL **without percent-encoding it** on `get`, `update`, and
`delete` — the JS client does encode it
([#590](https://github.com/Primitive-Labs/js-bao-wss/issues/590)). Prefer
ASCII-safe `groupType` identifiers from Swift until this is fixed.
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

Update the configuration's rule set or auto-add-creator setting. Pass `null` (JS) / `NSNull()` (Swift) for `ruleSetId` to remove the current rule set.

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
