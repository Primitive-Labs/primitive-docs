[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / LlmChatOptions

# Interface: LlmChatOptions

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:10](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L10)

## Properties

### attachments?

> `optional` **attachments**: (\{ `base64?`: `string`; `mime?`: `string`; `type`: `"image"`; `url?`: `string`; \} \| \{ `base64`: `string`; `mime?`: `string`; `type`: `"audio"`; \} \| \{ `base64?`: `string`; `filename?`: `string`; `type`: `"pdf"`; `url?`: `string`; \})[]

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:13](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L13)

***

### max\_tokens?

> `optional` **max\_tokens**: `number`

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:23](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L23)

***

### messages

> **messages**: `object`[]

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:12](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L12)

#### content?

> `optional` **content**: `any`

#### role

> **role**: `string`

***

### model?

> `optional` **model**: `string`

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:11](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L11)

***

### plugins?

> `optional` **plugins**: `any`[]

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:19](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L19)

***

### reasoning?

> `optional` **reasoning**: [`ReasoningOptions`](ReasoningOptions.md)

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:24](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L24)

***

### temperature?

> `optional` **temperature**: `number`

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:18](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L18)

***

### tool\_choice?

> `optional` **tool\_choice**: `any`

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:21](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L21)

***

### tools?

> `optional` **tools**: `any`

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:20](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L20)

***

### top\_p?

> `optional` **top\_p**: `number`

Defined in: [packages/js-bao-wss-client/api/llmApi.ts:22](https://github.com/Primitive-Labs/js-bao-wss-client/blob/90911e51f7ddf72d9b0bf2042782071e5ad51418/api/llmApi.ts#L22)
