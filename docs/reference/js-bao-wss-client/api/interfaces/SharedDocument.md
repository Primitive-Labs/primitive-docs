[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / SharedDocument

# Interface: SharedDocument

A document shared with the current user.

Issue #858: shared rows now carry the same base `Document` fields owned
rows do (`createdBy`/`createdAt`/`lastModified` + `tags`/`metadata`/
`thumbnailBlobId` when set) — hence the `extends DocumentInfo`. The
shared-only semantic extras (`source`/`grantedBy`/`invitationId`) are
layered on top. `permission` is the granted level (never `"owner"` — owned
docs surface via [MeAPI.ownedDocuments](MeAPI.md#owneddocuments) instead).

## Extends

- [`DocumentInfo`](DocumentInfo.md)

## Properties

### createdAt

> **createdAt**: `string`

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`createdAt`](DocumentInfo.md#createdat)

***

### createdBy

> **createdBy**: `string`

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`createdBy`](DocumentInfo.md#createdby)

***

### documentId

> **documentId**: `string`

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`documentId`](DocumentInfo.md#documentid)

***

### grantedAt?

> `optional` **grantedAt**: `string`

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`grantedAt`](DocumentInfo.md#grantedat)

***

### grantedBy

> **grantedBy**: `string`

Who granted access (the actor) — always present on shared rows.

***

### invitationAccepted?

> `optional` **invitationAccepted**: `boolean`

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`invitationAccepted`](DocumentInfo.md#invitationaccepted)

***

### invitationId?

> `optional` **invitationId**: `string`

Present when source is "invitation" — the pending invitation ID

***

### lastModified

> **lastModified**: `string`

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`lastModified`](DocumentInfo.md#lastmodified)

***

### metadata?

> `optional` **metadata**: `unknown`

Opaque JSON-stringified metadata blob (≤ 4 KB serialized UTF-8). The
platform does not introspect this — it round-trips whatever the caller
sets. Use replace semantics on update; pass `null` to clear.

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`metadata`](DocumentInfo.md#metadata)

***

### permission

> **permission**: `"owner"` \| `"read-write"` \| `"reader"` \| `"admin"`

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`permission`](DocumentInfo.md#permission)

***

### source?

> `optional` **source**: `"invitation"` \| `"permission"`

"permission" for accepted shares, "invitation" for pending legacy DocumentInvitations

***

### tags?

> `optional` **tags**: `string`[]

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`tags`](DocumentInfo.md#tags)

***

### thumbnailBlobId?

> `optional` **thumbnailBlobId**: `string`

Optional reference to a Blob owned by this document. The blob lifecycle
is independent — a dangling reference (blob deleted out-of-band) is the
UI's responsibility to handle (typically: render a placeholder on 404).

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`thumbnailBlobId`](DocumentInfo.md#thumbnailblobid)

***

### title

> **title**: `string`

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`title`](DocumentInfo.md#title)

***

### upgradedFromPermission?

> `optional` **upgradedFromPermission**: `string`

#### Inherited from

[`DocumentInfo`](DocumentInfo.md).[`upgradedFromPermission`](DocumentInfo.md#upgradedfrompermission)
