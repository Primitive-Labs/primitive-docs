[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / GeminiAPI

# Interface: GeminiAPI

## Methods

### countTokens()

> **countTokens**(`options`): `Promise`\<\{ `candidates?`: `number`; `promptTokens?`: `number`; `raw?`: `unknown`; `totalTokens`: `number`; \}\>

Counts the number of tokens in a prompt without generating a response.

#### Parameters

##### options

[`GeminiPromptOptions`](GeminiPromptOptions.md)

The prompt to measure (same shape as generate, but no response is produced)

#### Returns

`Promise`\<\{ `candidates?`: `number`; `promptTokens?`: `number`; `raw?`: `unknown`; `totalTokens`: `number`; \}\>

Object with `totalTokens` count and optional `promptTokens`, `candidates`, and `raw` response

***

### generate()

> **generate**(`options`): `Promise`\<[`GeminiGenerateResult`](GeminiGenerateResult.md)\>

Sends a structured prompt to Gemini and returns the generated response.

#### Parameters

##### options

[`GeminiPromptOptions`](GeminiPromptOptions.md)

Configuration for the generation request

#### Returns

`Promise`\<[`GeminiGenerateResult`](GeminiGenerateResult.md)\>

***

### generateRaw()

> **generateRaw**(`options`): `Promise`\<`any`\>

Sends a raw request body to a specified Gemini model, bypassing structured prompt formatting.

#### Parameters

##### options

[`GeminiGenerateRawOptions`](GeminiGenerateRawOptions.md)

Raw request configuration

#### Returns

`Promise`\<`any`\>

***

### models()

> **models**(): `Promise`\<\{ `defaultModel`: `string`; `models`: `string`[]; \}\>

Lists available Gemini models and returns the default model name.

#### Returns

`Promise`\<\{ `defaultModel`: `string`; `models`: `string`[]; \}\>

Object with `models` array and `defaultModel` name
