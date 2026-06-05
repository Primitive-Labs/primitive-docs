# gemini — `client.gemini`

Generate content with Google Gemini models: structured prompts, raw passthrough, model discovery, and token counting.

Every generate call fires `prompt_started` / `prompt_succeeded` / `prompt_failed` analytics events. Provider/transport failures from `generate` / `countTokens` / `generateRaw` are normalized to `JsBaoError(GEMINI_ERROR)`.

## generate(options)

Send a structured prompt to Gemini and return the generated response.

::: code-group
<<< ./snippets/gemini/generate.ts#example{ts} [JavaScript]
<<< ./snippets/gemini/generate.swift#example{swift} [Swift]
:::

## generateRaw(options)

Send a raw request body to a specified model, bypassing structured prompt formatting. `model` and `body` are required.

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
