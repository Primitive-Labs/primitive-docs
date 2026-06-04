# rule-sets — `client.ruleSets`

Define, inspect, and simulate CEL-based access rule sets for resource types.

::: tip Now typed
Both surfaces use named types field-for-field — `RuleSetInfo`, `RuleSetSchema`,
`CreateRuleSetParams` / `UpdateRuleSetParams`, the nested CEL `ModelRulesInfo` /
`TriggerDefInfo` rule grammar, `TestRuleSetParams` / `RuleSetTestResult`, and
`DebugRuleSetParams` / `RuleSetDebugResult`. `list` takes a typed
`ListRuleSetsOptions`, and `delete` returns `SuccessResult`. CEL evaluation
`context`, simulated `record` data, the schema `resourceTypes` map, and trace
`args`/`result` stay opaque (`JSONValue`), mirroring JS's `any`
([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

## create(params)

Create a new rule set for a resource type, including its CEL trigger rules.

::: code-group
<<< ./snippets/rule-sets/create.ts#example{ts} [JavaScript]
<<< ./snippets/rule-sets/create.swift#example{swift} [Swift]
:::

## list(options?)

List rule sets, optionally filtered by resource type. Both surfaces take a
typed `ListRuleSetsOptions` object.

::: code-group
<<< ./snippets/rule-sets/list.ts#example{ts} [JavaScript]
<<< ./snippets/rule-sets/list.swift#example{swift} [Swift]
:::

## get(ruleSetId)

Retrieve a single rule set by its ID.

::: code-group
<<< ./snippets/rule-sets/get.ts#example{ts} [JavaScript]
<<< ./snippets/rule-sets/get.swift#example{swift} [Swift]
:::

## update(ruleSetId, params)

Update a rule set's name, description, or rules.

::: code-group
<<< ./snippets/rule-sets/update.ts#example{ts} [JavaScript]
<<< ./snippets/rule-sets/update.swift#example{swift} [Swift]
:::

## delete(ruleSetId)

Delete a rule set by its ID. Both surfaces return a typed success flag
(`{ success: boolean }` in JS, `SuccessResult` in Swift).

::: code-group
<<< ./snippets/rule-sets/delete.ts#example{ts} [JavaScript]
<<< ./snippets/rule-sets/delete.swift#example{swift} [Swift]
:::

## schema()

Retrieve the rule set schema describing available resource types.

::: code-group
<<< ./snippets/rule-sets/schema.ts#example{ts} [JavaScript]
<<< ./snippets/rule-sets/schema.swift#example{swift} [Swift]
:::

## test(ruleSetId, data)

Evaluate a rule set against a simulated request and return the access decision.

::: code-group
<<< ./snippets/rule-sets/test.ts#example{ts} [JavaScript]
<<< ./snippets/rule-sets/test.swift#example{swift} [Swift]
:::

## debug(data)

Debug rule evaluation for a real user, returning the full evaluation trace and context.

::: code-group
<<< ./snippets/rule-sets/debug.ts#example{ts} [JavaScript]
<<< ./snippets/rule-sets/debug.swift#example{swift} [Swift]
:::
