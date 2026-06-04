# prompts — `client.prompts`

Execute server-defined prompt templates by key.

## execute(promptKey, options)

Execute a prompt template with variables and return the result.

::: tip Divergent shape
Swift additionally carries a positional
`execute(promptKey:variables:modelOverride:configId:)` overload with no JS
analog — prefer the options-struct form for cross-client parity.
:::

::: code-group
<<< ./snippets/prompts/execute.ts#example{ts} [JavaScript]
<<< ./snippets/prompts/execute.swift#example{swift} [Swift]
:::

## get(promptKey)

Fetch a single prompt definition by key.

::: danger Swift-only — broken at runtime
Swift exposes `prompts.get`, but it calls an app-api route (`GET /prompts/{key}`)
that doesn't exist, so it returns a 404 at runtime
([#993](https://github.com/Primitive-Labs/js-bao-wss/issues/993)). JS exposes no
`prompts.get` at all (the JS `prompts` surface is `execute`-only). It's kept and
its return is now typed (`PromptInfo?`) for source parity, but do not rely on it.
:::

<<< ./snippets/prompts/get.swift#example{swift} [Swift]

## list()

List the prompts available to the current app/user.

::: danger Swift-only — broken at runtime
Swift exposes `prompts.list`, but it calls an app-api route (`GET /prompts`) that
doesn't exist, so it returns a 404 at runtime
([#993](https://github.com/Primitive-Labs/js-bao-wss/issues/993)). JS exposes no
`prompts.list` at all (the JS `prompts` surface is `execute`-only). It's kept and
its return is now typed (`[PromptInfo]`) for source parity, but do not rely on it.
:::

<<< ./snippets/prompts/list.swift#example{swift} [Swift]
