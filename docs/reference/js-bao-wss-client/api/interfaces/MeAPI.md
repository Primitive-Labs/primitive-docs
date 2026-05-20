[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / MeAPI

# Interface: MeAPI

## Methods

### cacheInfo()

> **cacheInfo**(): `Promise`\<\{ `ageMs?`: `number`; `updatedAt?`: `string`; \}\>

Returns cache metadata for the current user's profile entry.

#### Returns

`Promise`\<\{ `ageMs?`: `number`; `updatedAt?`: `string`; \}\>

Object with optional `updatedAt` timestamp and `ageMs` since last refresh

***

### clearCache()

> **clearCache**(): `Promise`\<`void`\>

Clears the cached profile so the next get() fetches fresh data from the server.

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`options?`): `Promise`\<[`UserProfile`](UserProfile.md) \| `null`\>

Retrieves the current user's profile, using the cache when available.

#### Parameters

##### options?

`GetMeOptions`

Controls caching and loading behavior

#### Returns

`Promise`\<[`UserProfile`](UserProfile.md) \| `null`\>

***

### ownedDocuments()

#### Call Signature

> **ownedDocuments**(`options`): `Promise`\<`DocumentListPage`\>

List documents the current user owns (issue #628).

Returns docs where the caller's `DocumentPermission.permission === "owner"`.
Mirrors [MeAPI.sharedDocuments](#shareddocuments) for parallel structure
("owned-by-me" vs "shared-with-me").

Returns the *current owner* set (not creators) — ownership transfer
updates `DocumentPermission.permission` without changing
`Document.createdBy`, so this method tracks live ownership.

Inherits the same offline-first / cache-aware machinery as the
(deprecated) `documents.list` reader: both call the same internal
helper, with the owner filter applied across local cache, network
response, and merged-result paths. The owner-only response is
cached additively (`authoritative: false`) — non-owner rows from a
prior `documents.list` call are NOT evicted; ownership-revocation
lag is accepted as an eventual-consistency tradeoff.

Cursor format is **raw JSON** (matching `/documents`), NOT base64url.

##### Parameters

###### options

[`OwnedDocumentsOptions`](OwnedDocumentsOptions.md) & `object`

Same option set as the legacy `documents.list`.

##### Returns

`Promise`\<`DocumentListPage`\>

#### Call Signature

> **ownedDocuments**(`options?`): `Promise`\<[`DocumentInfo`](DocumentInfo.md)[]\>

List documents the current user owns (issue #628).

Returns docs where the caller's `DocumentPermission.permission === "owner"`.
Mirrors [MeAPI.sharedDocuments](#shareddocuments) for parallel structure
("owned-by-me" vs "shared-with-me").

Returns the *current owner* set (not creators) — ownership transfer
updates `DocumentPermission.permission` without changing
`Document.createdBy`, so this method tracks live ownership.

Inherits the same offline-first / cache-aware machinery as the
(deprecated) `documents.list` reader: both call the same internal
helper, with the owner filter applied across local cache, network
response, and merged-result paths. The owner-only response is
cached additively (`authoritative: false`) — non-owner rows from a
prior `documents.list` call are NOT evicted; ownership-revocation
lag is accepted as an eventual-consistency tradeoff.

Cursor format is **raw JSON** (matching `/documents`), NOT base64url.

##### Parameters

###### options?

[`OwnedDocumentsOptions`](OwnedDocumentsOptions.md)

Same option set as the legacy `documents.list`.

##### Returns

`Promise`\<[`DocumentInfo`](DocumentInfo.md)[]\>

***

### pendingDocumentInvitations()

> **pendingDocumentInvitations**(): `Promise`\<`object`[]\>

Lists pending document invitations for the current user.

#### Returns

`Promise`\<`object`[]\>

***

### sharedDocuments()

> **sharedDocuments**(`options?`): `Promise`\<[`SharedDocumentListResult`](SharedDocumentListResult.md)\>

List documents shared with the current user.
Includes individually-shared documents (`DocumentPermission`, non-owner)
and pending legacy `DocumentInvitation`s. Pass `tag` to filter by a
document tag (issue #628 — parity with `documents.list({ tag })`).

#### Parameters

##### options?

[`SharedDocumentsOptions`](SharedDocumentsOptions.md)

#### Returns

`Promise`\<[`SharedDocumentListResult`](SharedDocumentListResult.md)\>

***

### update()

> **update**(`params`): `Promise`\<[`UserProfile`](UserProfile.md)\>

Update the current user's profile (name and/or external avatar URL).

#### Parameters

##### params

`UpdateMeParams`

Fields to update on the profile

#### Returns

`Promise`\<[`UserProfile`](UserProfile.md)\>

***

### uploadAvatar()

> **uploadAvatar**(`imageData`, `contentType`): `Promise`\<\{ `avatarUrl`: `string`; \}\>

Uploads an avatar image for the current user and returns the new avatar URL.

#### Parameters

##### imageData

The raw image binary to upload

`ArrayBuffer` | `File` | `Blob`

##### contentType

MIME type of the image (must be png, jpeg, gif, or webp)

`"image/png"` | `"image/jpeg"` | `"image/gif"` | `"image/webp"`

#### Returns

`Promise`\<\{ `avatarUrl`: `string`; \}\>

Object with the new `avatarUrl`
