[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / GeminiPromptOptions

# ~~Interface: GeminiPromptOptions~~

## Deprecated

The direct Gemini client API is deprecated and will be removed in
a future major release. Use [client.prompts.execute](PromptsAPI.md#execute)
(managed prompts) or a workflow `gemini.generate` step instead.

## Properties

### ~~generationConfig?~~

> `optional` **generationConfig**: `GeminiGenerationConfig`

***

### ~~messages~~

> **messages**: [`GeminiMessage`](GeminiMessage.md)[]

***

### ~~model?~~

> `optional` **model**: `string`

***

### ~~safety?~~

> `optional` **safety**: `GeminiSafetySetting`[]

***

### ~~structuredOutput?~~

> `optional` **structuredOutput**: [`GeminiStructuredOutput`](GeminiStructuredOutput.md)

***

### ~~system?~~

> `optional` **system**: [`GeminiContentPart`](../type-aliases/GeminiContentPart.md)[]
