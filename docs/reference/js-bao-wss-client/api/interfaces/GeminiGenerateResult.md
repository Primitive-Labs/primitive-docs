[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / GeminiGenerateResult

# ~~Interface: GeminiGenerateResult~~

## Deprecated

The direct Gemini client API is deprecated and will be removed in
a future major release. Use [client.prompts.execute](PromptsAPI.md#execute)
(managed prompts) or a workflow `gemini.generate` step instead.

## Properties

### ~~candidates?~~

> `optional` **candidates**: `GeminiCandidate`[]

***

### ~~message~~

> **message**: [`GeminiMessage`](GeminiMessage.md)

***

### ~~raw?~~

> `optional` **raw**: `unknown`

***

### ~~usage?~~

> `optional` **usage**: `object`

#### ~~promptTokens?~~

> `optional` **promptTokens**: `number`

#### ~~responseTokens?~~

> `optional` **responseTokens**: `number`

#### ~~totalTokens?~~

> `optional` **totalTokens**: `number`
