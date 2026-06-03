# llm — `client.llm`

Send chat completions to the configured LLM provider and discover available models.

::: tip Divergent shape
Both Swift `LlmAPI` methods take and return **untyped `[String: Any]`** where JS exposes typed interfaces — notably `chat` accepts a typed `LlmChatOptions` with structured `attachments` and `reasoning` unions that Swift represents as plain dictionaries. Both compile; the Swift examples use dict access. Tracked under [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954).
:::

## chat(options)

Send a chat completion request to the configured LLM provider. Supports image/audio/PDF attachments, tools, and reasoning options.

::: code-group
<<< ./snippets/llm/chat.ts#example{ts} [JavaScript]
<<< ./snippets/llm/chat.swift#example{swift} [Swift]
:::

## models()

List available LLM models and the server default.

::: tip Divergent shape
Swift returns an untyped `[String: Any]` envelope; JS returns a typed `{ models: string[]; defaultModel: string }` ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

::: code-group
<<< ./snippets/llm/models.ts#example{ts} [JavaScript]
<<< ./snippets/llm/models.swift#example{swift} [Swift]
:::
