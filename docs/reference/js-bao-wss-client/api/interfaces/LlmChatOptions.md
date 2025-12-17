[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / LlmChatOptions

# Interface: LlmChatOptions

## Properties

### attachments?

> `optional` **attachments**: (\{ `base64?`: `string`; `mime?`: `string`; `type`: `"image"`; `url?`: `string`; \} \| \{ `base64`: `string`; `mime?`: `string`; `type`: `"audio"`; \} \| \{ `base64?`: `string`; `filename?`: `string`; `type`: `"pdf"`; `url?`: `string`; \})[]

***

### max\_tokens?

> `optional` **max\_tokens**: `number`

***

### messages

> **messages**: `object`[]

#### content?

> `optional` **content**: `any`

#### role

> **role**: `string`

***

### model?

> `optional` **model**: `string`

***

### plugins?

> `optional` **plugins**: `any`[]

***

### reasoning?

> `optional` **reasoning**: [`ReasoningOptions`](ReasoningOptions.md)

***

### temperature?

> `optional` **temperature**: `number`

***

### tool\_choice?

> `optional` **tool\_choice**: `any`

***

### tools?

> `optional` **tools**: `any`

***

### top\_p?

> `optional` **top\_p**: `number`
