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

### pendingDocumentInvitations()

> **pendingDocumentInvitations**(): `Promise`\<`object`[]\>

Lists pending document invitations for the current user.

#### Returns

`Promise`\<`object`[]\>

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
