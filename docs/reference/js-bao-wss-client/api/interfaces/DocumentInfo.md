[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DocumentInfo

# Interface: DocumentInfo

## Properties

### createdAt

> **createdAt**: `string`

***

### createdBy

> **createdBy**: `string`

***

### documentId

> **documentId**: `string`

***

### grantedAt?

> `optional` **grantedAt**: `string`

***

### invitationAccepted?

> `optional` **invitationAccepted**: `boolean`

***

### lastModified

> **lastModified**: `string`

***

### metadata?

> `optional` **metadata**: `unknown`

Opaque JSON-stringified metadata blob (≤ 4 KB serialized UTF-8). The
platform does not introspect this — it round-trips whatever the caller
sets. Use replace semantics on update; pass `null` to clear.

***

### permission

> **permission**: `"owner"` \| `"read-write"` \| `"reader"` \| `"admin"`

***

### tags?

> `optional` **tags**: `string`[]

***

### thumbnailBlobId?

> `optional` **thumbnailBlobId**: `string`

Optional reference to a Blob owned by this document. The blob lifecycle
is independent — a dangling reference (blob deleted out-of-band) is the
UI's responsibility to handle (typically: render a placeholder on 404).

***

### title

> **title**: `string`

***

### upgradedFromPermission?

> `optional` **upgradedFromPermission**: `string`
