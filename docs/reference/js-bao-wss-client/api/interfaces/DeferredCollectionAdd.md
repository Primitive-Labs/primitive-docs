[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DeferredCollectionAdd

# Interface: DeferredCollectionAdd

Result of a deferred collection add — the email does not yet map to an
app user, so a `DeferredGroupAdd` row was created (or an existing
unresolved one was returned for idempotency). Storage reuses the
`_col-reader` / `_col-writer` system group composite, mirroring the
direct-add storage shape.

## Properties

### appInvitationCreated

> **appInvitationCreated**: `boolean`

***

### collectionId

> **collectionId**: `string`

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

### invitationId

> **invitationId**: `string`

The `AppInvitation` record created or reused for this email.

***

### inviteToken

> **inviteToken**: `string` \| `null`

Tokenized accept token; combine with your app's accept-page URL.

***

### permission

> **permission**: `"read-write"` \| `"reader"`

***

### status

> **status**: `"pending_signup"`
