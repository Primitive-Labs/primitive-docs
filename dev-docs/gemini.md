# gemini — `client.gemini`

Generate content with Google Gemini models: structured prompts, raw passthrough, model discovery, and token counting.

::: tip Divergent shape
Every Swift `GeminiAPI` method takes and returns **untyped `[String: Any]` / `Any`** where JS exposes named interfaces (`GeminiGenerateOptions`, `GeminiGenerateResult`, `GeminiPromptOptions`, …). Both compile; the Swift examples use dict access. Tracked under [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954). Per-method divergences (`models()` return shape, `generateRaw` error code) are noted inline.
:::

## generate(options)

Send a structured prompt to Gemini and return the generated response.

::: code-group
<<< ./snippets/gemini/generate.ts#example{ts} [JavaScript]
<<< ./snippets/gemini/generate.swift#example{swift} [Swift]
:::

## generateRaw(options)

Send a raw request body to a specified model, bypassing structured prompt formatting. `model` and `body` are required.

::: tip Divergent shape
Beyond the untyped options ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)), the client-side argument validation throws a **different error code**: Swift throws `INVALID_ARGUMENT`, JS throws `GEMINI_ERROR`. Catch accordingly when validating raw requests.
:::

::: code-group
<<< ./snippets/gemini/generate-raw.ts#example{ts} [JavaScript]
<<< ./snippets/gemini/generate-raw.swift#example{swift} [Swift]
:::

## models()

List available Gemini models and the server default.

::: tip Divergent shape
Swift returns an untyped `[String: Any]` envelope; JS returns a typed `{ models: string[]; defaultModel: string }` ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

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
