[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / SharedDocumentListResult

# Interface: SharedDocumentListResult

Issue #858: unified with DocumentListPage (`{ items, cursor }`,
raw-JSON cursor) — was previously `{ documents, nextCursor }` with a
base64url cursor. **Breaking change** vs. earlier client versions.

## Properties

### cursor?

> `optional` **cursor**: `string`

***

### items

> **items**: [`SharedDocument`](SharedDocument.md)[]
