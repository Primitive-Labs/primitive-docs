[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DeferredPermissionGrant

# Interface: DeferredPermissionGrant

Result of a deferred permission grant (user not yet in the app).

## Properties

### appInvitationCreated

> **appInvitationCreated**: `boolean`

***

### email

> **email**: `string`

***

### invitationId

> **invitationId**: `string`

The `AppInvitation` record created or reused for this email.

***

### inviteToken

> **inviteToken**: `string` \| `null`

Tokenized accept token; combine with your app's accept-page URL
 to build a working CTA for custom invitation emails.

***

### permission

> **permission**: `string`

***

### status

> **status**: `"pending_signup"`
