[**js-bao-wss-client**](../README.md)

***

[js-bao-wss-client](../globals.md) / GroupsAPI

# Interface: GroupsAPI

## Methods

### addMember()

> **addMember**(`groupType`, `groupId`, `params`): `Promise`\<[`GroupMemberInfo`](GroupMemberInfo.md)\>

Adds a user to a group by user ID or email address.

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

`Promise`\<[`GroupMemberInfo`](GroupMemberInfo.md)\>

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

### listUserMemberships()

> **listUserMemberships**(`userId`): `Promise`\<[`GroupMembershipInfo`](GroupMembershipInfo.md)[]\>

Lists all group memberships for a given user.

#### Parameters

##### userId

`string`

The ID of the user whose memberships to retrieve

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
