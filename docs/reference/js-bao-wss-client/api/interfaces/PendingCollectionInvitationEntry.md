[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / PendingCollectionInvitationEntry

# Interface: PendingCollectionInvitationEntry

A pending (deferred) collection invitation.

## Properties

### addedBy?

> `optional` **addedBy**: `string`

***

### createdAt

> **createdAt**: `string`

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

### permission

> **permission**: `"read-write"` \| `"reader"`

The permission the recipient will hold once they accept the invitation
and sign in. Derived from which system group (`_col-reader` /
`_col-writer`) the deferred grant lives in.
