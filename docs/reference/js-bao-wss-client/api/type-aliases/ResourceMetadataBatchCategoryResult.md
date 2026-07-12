[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / ResourceMetadataBatchCategoryResult

# Type Alias: ResourceMetadataBatchCategoryResult

> **ResourceMetadataBatchCategoryResult** = \{ `data`: `Record`\<`string`, `unknown`\>; `exists`: `boolean`; `ok`: `true`; `schemaVersion`: `number` \| `null`; \} \| \{ `code`: `string`; `message`: `string`; `ok`: `false`; `status`: `number`; \}

Per-category result inside a batch read — a discriminated union on `ok`. A
success carries the same fields as the single read (`data`, `schemaVersion`,
`exists`); a failure carries `status`/`code`/`message` and never `data`.
