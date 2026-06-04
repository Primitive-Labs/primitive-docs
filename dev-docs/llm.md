# llm — `client.llm`

Send chat completions to the configured LLM provider and discover available models.

::: warning Swift parity gap — no analytics events
Swift `LlmAPI.chat` emits **no analytics events**. JS fires `prompt_started` / `prompt_succeeded` / `prompt_failed` around each chat request; on Swift the auto-events context getter hardcodes `isEnabled = true` but nothing actually fires, so iOS produces no client-side LLM analytics. Treat `llm` auto-events as JS-only until Swift wires the context ([#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963), sweep llm D1).
:::

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
