# prompts — `client.prompts`

Execute server-defined prompt templates by key.

## execute(promptKey, options)

Execute a prompt template with variables and return the result.

::: tip Divergent shape
JS `execute` resolves to a typed `ExecutePromptResult` (`success`, `output`,
`metrics`, `rawResponse`, `configId`); Swift returns an untyped `[String: Any]`,
so read fields with dictionary casts ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/prompts/execute.ts#example{ts} [JavaScript]
<<< ./snippets/prompts/execute.swift#example{swift} [Swift]
:::

## get(promptKey)

Fetch a single prompt definition by key.

::: warning Swift-only — broken at runtime
Swift exposes `prompts.get`, but it calls an app-api route that doesn't exist,
so it returns a 404 at runtime. There is no JS equivalent ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

<<< ./snippets/prompts/get.swift#example{swift} [Swift]

## list()

List the prompts available to the current app/user.

::: warning Swift-only — broken at runtime
Swift exposes `prompts.list`, but it calls an app-api route that doesn't exist,
so it returns a 404 at runtime. There is no JS equivalent ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

<<< ./snippets/prompts/list.swift#example{swift} [Swift]
