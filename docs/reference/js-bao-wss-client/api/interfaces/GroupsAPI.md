[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / GroupsAPI

# Interface: GroupsAPI

## Methods

### addMember()

> **addMember**(`groupType`, `groupId`, `params`): `Promise`\<[`GroupAddMemberResult`](../type-aliases/GroupAddMemberResult.md)\>

Adds a user to a group by user ID or email address.

Returns a discriminated union based on whether the target is an existing
app user (direct add) or a yet-to-sign-up email (deferred add):

- `{ status: "added", userId, addedAt, addedBy, ... }` — new membership.
- `{ status: "already_member", userId, addedAt, addedBy, ... }` — the
  user was already a member (no error; `addedAt`/`addedBy` reflect the
  pre-existing row). Replaces the previous HTTP 409 on duplicate.
- `{ status: "pending_signup", email, deferredId, expiresAt, ... }` —
  email not yet in the app; a DeferredGroupAdd row has been created (or
  an existing unresolved one is returned idempotently).

#### Parameters

##### groupType

`string`

The type category of the group

##### groupId

`string`

The unique identifier of the group within its type

##### params

`AddGroupMemberParams`

User identifier (provide either userId or email, not both)

#### Returns

`Promise`\<[`GroupAddMemberResult`](../type-aliases/GroupAddMemberResult.md)\>

***

### create()

> **create**(`params`): `Promise`\<[`GroupInfo`](GroupInfo.md)\>

Creates a new group with the specified type, ID, and name.

#### Parameters

##### params

`CreateGroupParams`

Configuration for the new group

#### Returns

`Promise`\<[`GroupInfo`](GroupInfo.md)\>

***

### delete()

> **delete**(`groupType`, `groupId`): `Promise`\<\{ `success`: `boolean`; \}\>

Deletes a group by its type and ID.

#### Parameters

##### groupType

`string`

The type category of the group to delete

##### groupId

`string`

The unique identifier of the group within its type

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### get()

> **get**(`groupType`, `groupId`): `Promise`\<[`GroupInfo`](GroupInfo.md)\>

Retrieves a single group by its type and ID.

#### Parameters

##### groupType

`string`

The type category of the group to retrieve

##### groupId

`string`

The unique identifier of the group within its type

#### Returns

`Promise`\<[`GroupInfo`](GroupInfo.md)\>

***

### list()

> **list**(`options?`): `Promise`\<`PaginatedResult`\<[`GroupInfo`](GroupInfo.md)\>\>

Lists groups, optionally filtered by group type.

#### Parameters

##### options?

`ListGroupsOptions`

Filtering and pagination options

#### Returns

`Promise`\<`PaginatedResult`\<[`GroupInfo`](GroupInfo.md)\>\>

***

### listDatabases()

> **listDatabases**(`groupType`, `groupId`): `Promise`\<[`GroupDatabaseInfo`](GroupDatabaseInfo.md)[]\>

Lists all databases accessible to a group via DatabaseGroupPermission.

#### Parameters

##### groupType

`string`

The type category of the group

##### groupId

`string`

The unique identifier of the group within its type

#### Returns

`Promise`\<[`GroupDatabaseInfo`](GroupDatabaseInfo.md)[]\>

***

### listDocuments()

> **listDocuments**(`groupType`, `groupId`): `Promise`\<[`GroupDocumentInfo`](GroupDocumentInfo.md)[]\>

Lists all documents accessible to a group.

#### Parameters

##### groupType

`string`

The type category of the group

##### groupId

`string`

The unique identifier of the group within its type

#### Returns

`Promise`\<[`GroupDocumentInfo`](GroupDocumentInfo.md)[]\>

***

### listMembers()

> **listMembers**(`groupType`, `groupId`, `options?`): `Promise`\<\{ `cursor?`: `string`; `items`: [`GroupMemberInfo`](GroupMemberInfo.md)[]; \}\>

Lists members of a group with optional pagination.

#### Parameters

##### groupType

`string`

The type category of the group

##### groupId

`string`

The unique identifier of the group within its type

##### options?

Pagination options (limit, cursor)

###### cursor?

`string`

###### limit?

`number`

#### Returns

`Promise`\<\{ `cursor?`: `string`; `items`: [`GroupMemberInfo`](GroupMemberInfo.md)[]; \}\>

***

### listPendingInvitations()

> **listPendingInvitations**(`groupType`, `groupId`): `Promise`\<[`PendingGroupInvitationEntry`](PendingGroupInvitationEntry.md)[]\>

Lists pending (unresolved, non-expired) invitations scoped to a group.
Returns denormalized rows so callers can render "members + pending"
without touching the internal deferred-grants surface.

#### Parameters

##### groupType

`string`

The type category of the group

##### groupId

`string`

The unique identifier of the group within its type

#### Returns

`Promise`\<[`PendingGroupInvitationEntry`](PendingGroupInvitationEntry.md)[]\>

***

### listUserMemberships()

> **listUserMemberships**(`userId`, `options?`): `Promise`\<[`GroupMembershipInfo`](GroupMembershipInfo.md)[]\>

Lists all group memberships for a given user.

#### Parameters

##### userId

`string`

The ID of the user whose memberships to retrieve

##### options?

[`ListUserMembershipsOptions`](ListUserMembershipsOptions.md)

Optional filters (e.g. `groupType` to limit to one group type)

#### Returns

`Promise`\<[`GroupMembershipInfo`](GroupMembershipInfo.md)[]\>

***

### removeMember()

> **removeMember**(`groupType`, `groupId`, `userIdOrParams`): `Promise`\<\{ `success`: `boolean`; \}\>

Removes a member from a group by user ID or email address.

#### Parameters

##### groupType

`string`

The type category of the group

##### groupId

`string`

The unique identifier of the group within its type

##### userIdOrParams

A user ID string, or an object with an email field to remove by email

`string` | \{ `email`: `string`; \}

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### update()

> **update**(`groupType`, `groupId`, `params`): `Promise`\<[`GroupInfo`](GroupInfo.md)\>

Updates a group's name or description.

#### Parameters

##### groupType

`string`

The type category of the group to update

##### groupId

`string`

The unique identifier of the group within its type

##### params

`UpdateGroupParams`

Fields to update on the group

#### Returns

`Promise`\<[`GroupInfo`](GroupInfo.md)\>
