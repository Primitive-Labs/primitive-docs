[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / AcceptInviteResult

# Interface: AcceptInviteResult

Result of `client.invitations.accept(inviteToken)` (#466). The invitation
is marked accepted (write-once) and all deferred grants linked to it
resolve to the authenticated user.

## Properties

### grantsResolved

> **grantsResolved**: `object`

#### documents

> **documents**: `number`

#### groups

> **groups**: `number`

***

### invitationId

> **invitationId**: `string`

***

### status

> **status**: `"accepted"`
