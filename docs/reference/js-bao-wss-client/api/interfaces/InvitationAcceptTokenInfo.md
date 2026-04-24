[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / InvitationAcceptTokenInfo

# Interface: InvitationAcceptTokenInfo

Envelope returned by `invitations.getAcceptToken(invitationId)`. Carries
the raw token so callers can build their own accept URL. The platform
does not compose URLs because apps own their own accept-page routing.

## Properties

### accepted

> **accepted**: `boolean`

***

### acceptedAt

> **acceptedAt**: `string` \| `null`

***

### email

> **email**: `string`

***

### expiresAt

> **expiresAt**: `string` \| `null`

***

### invitationId

> **invitationId**: `string`

***

### inviteToken

> **inviteToken**: `string` \| `null`

***

### status

> **status**: `"pending"` \| `"accepted"` \| `"expired"`

Lifecycle status: `pending` until accepted or expired.
