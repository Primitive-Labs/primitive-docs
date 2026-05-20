[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DirectCollectionAdd

# Interface: DirectCollectionAdd

Result of a direct collection add — the email or userId mapped to an
existing app user, so a real `_col-reader` / `_col-writer` AppMembership
row exists (or was just created).

## Properties

### addedAt

> **addedAt**: `string`

***

### addedBy

> **addedBy**: `string`

***

### permission

> **permission**: `"read-write"` \| `"reader"`

***

### status

> **status**: `"added"` \| `"already_member"`

"added" = new membership created by this call.
 "already_member" = the user was already in the target system group.

***

### userEmail?

> `optional` **userEmail**: `string`

***

### userId

> **userId**: `string`

***

### userName?

> `optional` **userName**: `string`
