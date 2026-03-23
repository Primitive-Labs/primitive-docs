[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / LlmAPI

# Interface: LlmAPI

## Methods

### chat()

> **chat**(`options`): `Promise`\<\{ `annotations?`: `any`; `content`: `any`; `raw?`: `any`; `role`: `string`; \}\>

Sends a chat completion request to the configured LLM provider.

#### Parameters

##### options

[`LlmChatOptions`](LlmChatOptions.md)

Configuration for the chat request

#### Returns

`Promise`\<\{ `annotations?`: `any`; `content`: `any`; `raw?`: `any`; `role`: `string`; \}\>

***

### models()

> **models**(): `Promise`\<\{ `defaultModel`: `string`; `models`: `string`[]; \}\>

Lists available LLM models and returns the default model name.

#### Returns

`Promise`\<\{ `defaultModel`: `string`; `models`: `string`[]; \}\>
