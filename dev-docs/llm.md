# llm — `client.llm`

Send chat completions to the configured LLM provider and discover available models.

`chat` fires `prompt_started` / `prompt_succeeded` / `prompt_failed` analytics events around each request.

## chat(options)

Send a chat completion request to the configured LLM provider. Supports image/audio/PDF attachments, tools, and reasoning options.

::: code-group
<<< ./snippets/llm/chat.ts#example{ts} [JavaScript]
<<< ./snippets/llm/chat.swift#example{swift} [Swift]
:::

## models()

List available LLM models and the server default. Returns a typed `LlmModelsResponse` (`models: [String]`, `defaultModel: String`), matching JS's `{ models, defaultModel }`.

::: code-group
<<< ./snippets/llm/models.ts#example{ts} [JavaScript]
<<< ./snippets/llm/models.swift#example{swift} [Swift]
:::
