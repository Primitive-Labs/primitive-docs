[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / OwnedDocumentsOptions

# Interface: OwnedDocumentsOptions

Options for `client.me.ownedDocuments(...)`. Mirrors the legacy
`client.documents.list(...)` option set so the new owner-only reader has
full offline-first / cache-aware parity. See [MeAPI.ownedDocuments](MeAPI.md#owneddocuments).

## Properties

### cursor?

> `optional` **cursor**: `string` \| `null`

Pagination cursor (raw JSON, matching `/documents` — NOT base64url).

***

### forward?

> `optional` **forward**: `boolean`

If true, sorts results in chronological order (oldest first).

***

### includeRoot?

> `optional` **includeRoot**: `boolean`

Include the app's root document in results (excluded by default).

***

### limit?

> `optional` **limit**: `number`

Maximum number of documents to return per page.

***

### localOnly?

> `optional` **localOnly**: `boolean`

If true, returns only documents that have local data on this device, ignoring the server entirely.

***

### refreshFromServer?

> `optional` **refreshFromServer**: `boolean`

If false, skips fetching from the server and returns only cached metadata (defaults to true).

***

### returnPage?

> `optional` **returnPage**: `boolean`

If true, returns a `DocumentListPage` with a cursor instead of a flat array.

***

### serverTimeoutMs?

> `optional` **serverTimeoutMs**: `number`

Maximum time in milliseconds to wait for the server response (defaults to 10000).

***

### tag?

> `optional` **tag**: `string` \| `null`

Filter results to only documents that have this tag.

***

### waitForLoad?

> `optional` **waitForLoad**: `"local"` \| `"network"` \| `"localIfAvailableElseNetwork"`

Cache-read strategy.
