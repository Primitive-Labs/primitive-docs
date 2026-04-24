[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / AppInvitationInfo

# Interface: AppInvitationInfo

## Properties

### accepted

> **accepted**: `boolean`

***

### acceptedAt?

> `optional` **acceptedAt**: `string`

***

### appId?

> `optional` **appId**: `string`

***

### email

> **email**: `string`

***

### expiresAt?

> `optional` **expiresAt**: `string`

***

### invitationId

> **invitationId**: `string`

***

### invitedAt

> **invitedAt**: `string`

***

### invitedBy

> **invitedBy**: `string`

***

### inviteToken?

> `optional` **inviteToken**: `string` \| `null`

Tokenized accept token — combine with your app's accept-page URL
 to build a working CTA (e.g. `${baseUrl}/invite/accept?inviteToken=…`).
 `null` only for legacy rows that have not been upgraded yet — new
 invitations always have one.

***

### note?

> `optional` **note**: `string` \| `null`

***

### role

> **role**: `string`

***

### source?

> `optional` **source**: `string` \| `null`
