[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / LlmAPI

# Interface: LlmAPI

## Methods

### ~~chat()~~

> **chat**(`options`): `Promise`\<\{ `annotations?`: `any`; `content`: `any`; `raw?`: `any`; `role`: `string`; \}\>

Sends a chat completion request to the configured LLM provider.

#### Parameters

##### options

[`LlmChatOptions`](LlmChatOptions.md)

Configuration for the chat request

#### Returns

`Promise`\<\{ `annotations?`: `any`; `content`: `any`; `raw?`: `any`; `role`: `string`; \}\>

The assistant message with `role`, `content`, optional `annotations`, and `raw` provider response

#### Deprecated

The direct LLM client API is deprecated and will be removed in a
future major release. Use [client.prompts.execute](PromptsAPI.md#execute)
(managed prompts) or a workflow `llm.chat` step instead.

***

### ~~models()~~

> **models**(): `Promise`\<\{ `defaultModel`: `string`; `models`: `string`[]; \}\>

Lists available LLM models and returns the default model name.

#### Returns

`Promise`\<\{ `defaultModel`: `string`; `models`: `string`[]; \}\>

Object with `models` array and `defaultModel` name

#### Deprecated

The direct LLM client API is deprecated and will be removed in a
future major release. Use [client.prompts.execute](PromptsAPI.md#execute)
(managed prompts) or a workflow `llm.chat` step instead.
