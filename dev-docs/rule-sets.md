# rule-sets — `client.ruleSets`

Define, inspect, and simulate CEL-based access rule sets for resource types.

::: tip Divergent shape
Every Swift `ruleSets` method takes and returns an **untyped `[String: Any]`** where JS
uses named interfaces — `RuleSetInfo`, `RuleSetSchema`, `CreateRuleSetParams`, the nested CEL
`ModelRulesInfo` / `TriggerDefInfo` rule grammar, `RuleSetTestResult`, and `RuleSetDebugResult`.
Both compile; the shapes differ ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

## create(params)

Create a new rule set for a resource type, including its CEL trigger rules.

::: code-group
<<< ./snippets/rule-sets/create.ts#example{ts} [JavaScript]
<<< ./snippets/rule-sets/create.swift#example{swift} [Swift]
:::

## list(options?)

List rule sets, optionally filtered by resource type. JS takes a typed
`ListRuleSetsOptions` object; Swift takes a positional `resourceType:` filter.

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

Delete a rule set by its ID. JS returns a typed `{ success: boolean }`; Swift returns
an untyped `[String: Any]` envelope ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).

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
