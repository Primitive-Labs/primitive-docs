[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / DirectGroupAdd

# Interface: DirectGroupAdd

Result of a direct group add — the email or userId mapped to an existing
app user, so a real AppMembership row exists (or was just created).

## Properties

### addedAt

> **addedAt**: `string`

***

### addedBy

> **addedBy**: `string`

***

### status

> **status**: `"added"` \| `"already_member"`

"added" = new membership created by this call.
 "already_member" = the user was already a member (response fields
 reflect the existing membership row, not "now").

***

### userEmail?

> `optional` **userEmail**: `string`

***

### userId

> **userId**: `string`

***

### userName?

> `optional` **userName**: `string`
