# prompts — `client.prompts`

Execute server-defined prompt templates by key.

## execute(promptKey, options)

Execute a prompt template with variables and return the result.

::: warning Swift parity gap
JS `execute` resolves to a typed `ExecutePromptResult` (`success`, `output`,
`metrics`, `rawResponse`, `configId`); Swift returns an untyped `[String: Any]`,
so read fields with dictionary casts (sweep prompts D2,
[#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)). Swift also
coerces a non-dict/undecodable body to an empty `[:]` (`?? [:]`), so a malformed
response reads as `success == nil` rather than throwing — JS rejects instead.
:::

::: tip Divergent shape
Swift additionally carries a positional
`execute(promptKey:variables:modelOverride:configId:)` overload with no JS
analog — prefer the options-struct form for cross-client parity (sweep
prompts D3, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/prompts/execute.ts#example{ts} [JavaScript]
<<< ./snippets/prompts/execute.swift#example{swift} [Swift]
:::

## get(promptKey)

Fetch a single prompt definition by key.

::: warning Swift-only — broken at runtime
Swift exposes `prompts.get`, but it calls an app-api route (`GET /prompts/{key}`)
that doesn't exist, so it returns a 404 at runtime. JS exposes no `prompts.get`
at all (the JS `prompts` surface is `execute`-only). Sweep prompts D1 — no
tracking issue filed; this is the missing-route/Swift-only gap, not the
`[String: Any]` typedness umbrella (#954).
:::

<<< ./snippets/prompts/get.swift#example{swift} [Swift]

## list()

List the prompts available to the current app/user.

::: warning Swift-only — broken at runtime
Swift exposes `prompts.list`, but it calls an app-api route (`GET /prompts`) that
doesn't exist, so it returns a 404 at runtime. JS exposes no `prompts.list` at
all (the JS `prompts` surface is `execute`-only). Sweep prompts D1 — no tracking
issue filed; this is the missing-route/Swift-only gap, not the `[String: Any]`
typedness umbrella (#954).
:::

<<< ./snippets/prompts/list.swift#example{swift} [Swift]
