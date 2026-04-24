[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DeferredGroupAdd

# Interface: DeferredGroupAdd

Result of a deferred group add — the email does not yet map to an app
user, so a DeferredGroupAdd row was created (or an existing unresolved
one was returned for idempotency). The deferredId can be passed to
`client.invitations.revokeDeferredGrant(deferredId, "group")` to cancel
the pending add.

The invitation + tokenized accept token fields let callers send their own
custom invitation emails with a working CTA — combine `inviteToken` with
the app's own accept-page URL to form the CTA.

## Properties

### appInvitationCreated

> **appInvitationCreated**: `boolean`

***

### deferredId

> **deferredId**: `string`

***

### email

> **email**: `string`

***

### expiresAt

> **expiresAt**: `string`

***

### groupId

> **groupId**: `string`

***

### groupType

> **groupType**: `string`

***

### invitationId

> **invitationId**: `string`

The `AppInvitation` record created or reused for this email.

***

### inviteToken

> **inviteToken**: `string` \| `null`

Tokenized accept token; combine with your app's accept-page URL.

***

### status

> **status**: `"pending_signup"`
