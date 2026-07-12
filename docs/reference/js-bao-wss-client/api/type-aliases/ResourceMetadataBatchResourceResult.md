[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / ResourceMetadataBatchResourceResult

# Type Alias: ResourceMetadataBatchResourceResult

> **ResourceMetadataBatchResourceResult** = \{ `categories`: `Record`\<`string`, [`ResourceMetadataBatchCategoryResult`](ResourceMetadataBatchCategoryResult.md)\>; `ok`: `true`; `resourceId`: `string`; `resourceType`: `string`; \} \| \{ `code`: `string`; `message`: `string`; `ok`: `false`; `resourceId`: `string`; `resourceType`: `string`; `status`: `number`; \}

Per-resource result inside a batch read. `ok: true` carries a per-category
map; `ok: false` is an item-level fault (malformed segment, or missing
`categories`) that applies to the whole item.
