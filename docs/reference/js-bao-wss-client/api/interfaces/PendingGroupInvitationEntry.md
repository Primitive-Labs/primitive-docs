[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / PendingGroupInvitationEntry

# Interface: PendingGroupInvitationEntry

A pending (deferred) group invitation.

## Properties

### addedBy?

> `optional` **addedBy**: `string`

***

### createdAt

> **createdAt**: `string`

***

### deferredId

> **deferredId**: `string`

Deferred-grant id for this pending invitation. Pass to
`client.invitations.revokeDeferredGrant(deferredId, "group")` to cancel it.

***

### email

> **email**: `string`

***

### expiresAt

> **expiresAt**: `string`

***

### invitationId

> **invitationId**: `string`

***

### role

> **role**: `string`

Role the user will hold after signup. Always "member" today.
