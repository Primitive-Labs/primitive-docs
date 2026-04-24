[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / PendingInvitationEntry

# Interface: PendingInvitationEntry

A pending (deferred) invitation scoped to a single resource. Denormalized
shape so UIs can render "people with access + pending invitations" without
touching the internal `deferredGrants.*` surface.

## Properties

### createdAt

> **createdAt**: `string`

ISO timestamp when the deferred grant was created.

***

### email

> **email**: `string`

Email that was invited.

***

### expiresAt

> **expiresAt**: `string`

ISO timestamp when the deferred grant expires.

***

### grantedBy?

> `optional` **grantedBy**: `string`

User who initiated the share.

***

### invitationId

> **invitationId**: `string`

ID of the underlying AppInvitation; useful for `invitations.delete`.

***

### permission

> **permission**: `string`

Document permission level that will be granted on signup.
