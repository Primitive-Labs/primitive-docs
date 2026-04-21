[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / GrantDatabaseGroupPermissionParams

# Interface: GrantDatabaseGroupPermissionParams

Parameters for granting a group permission on a database.

## Properties

### groupId

> **groupId**: `string`

The identifier of the group to grant permission to.

***

### groupType

> **groupType**: `string`

The type of group (e.g., "team", "role").

***

### permission

> **permission**: `"manager"`

The permission level to grant (only "manager" is supported for groups).
