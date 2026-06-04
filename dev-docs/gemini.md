# gemini — `client.gemini`

Generate content with Google Gemini models: structured prompts, raw passthrough, model discovery, and token counting.

::: danger Swift parity gap — no analytics, no error normalization
Across **all** `gemini.*` methods, the Swift `GeminiAPI` emits **no analytics events** — JS fires `prompt_started` / `prompt_succeeded` / `prompt_failed` for every generate call, but the Swift auto-events engine isn't wired (the context getter hardcodes `isEnabled = true` yet nothing fires). Swift also does **not** normalize provider failures to the `GEMINI_ERROR` code the way JS does. Until both are aligned, treat gemini analytics as JS-only and don't rely on a uniform error code on iOS ([#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963), sweep gemini D2).
:::

## generate(options)

Send a structured prompt to Gemini and return the generated response.

::: code-group
<<< ./snippets/gemini/generate.ts#example{ts} [JavaScript]
<<< ./snippets/gemini/generate.swift#example{swift} [Swift]
:::

## generateRaw(options)

Send a raw request body to a specified model, bypassing structured prompt formatting. `model` and `body` are required.

::: tip Divergent error code
The client-side argument validation throws a **different error code**: Swift throws `INVALID_ARGUMENT`, JS throws `GEMINI_ERROR`. Catch accordingly when validating raw requests.
:::

::: code-group
<<< ./snippets/gemini/generate-raw.ts#example{ts} [JavaScript]
<<< ./snippets/gemini/generate-raw.swift#example{swift} [Swift]
:::

## models()

List available Gemini models and the server default. Swift returns a typed `GeminiModelsResult` (`models: [String]`, `defaultModel: String`), matching JS.

::: code-group
<<< ./snippets/gemini/models.ts#example{ts} [JavaScript]
<<< ./snippets/gemini/models.swift#example{swift} [Swift]
:::

## countTokens(options)

Count the tokens in a prompt without generating a response.

::: code-group
<<< ./snippets/gemini/count-tokens.ts#example{ts} [JavaScript]
<<< ./snippets/gemini/count-tokens.swift#example{swift} [Swift]
:::
