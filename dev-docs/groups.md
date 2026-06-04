# groups — `client.groups`

Create and manage groups, their membership, pending invitations, and the
documents and databases shared with them. The signed-in user's own memberships
are reachable via `listUserMemberships`.

## create(params)

Create a new group. `groupType`, `groupId`, and `name` are required;
`description` is optional.

::: code-group
<<< ./snippets/groups/create.ts#example{ts} [JavaScript]
<<< ./snippets/groups/create.swift#example{swift} [Swift]
:::

## list(options?)

List groups, optionally filtered by `type`, with cursor pagination.

Swift returns a typed `PaginatedResult<GroupInfo>` and accepts the same
`includeSystem` option as JS (to surface platform-internal `_`-prefixed groups).

::: code-group
<<< ./snippets/groups/list.ts#example{ts} [JavaScript]
<<< ./snippets/groups/list.swift#example{swift} [Swift]
:::

## get(groupType, groupId)

Retrieve a single group by its type and ID.

::: code-group
<<< ./snippets/groups/get.ts#example{ts} [JavaScript]
<<< ./snippets/groups/get.swift#example{swift} [Swift]
:::

## update(groupType, groupId, params)

Update a group's `name` and/or `description`.

::: code-group
<<< ./snippets/groups/update.ts#example{ts} [JavaScript]
<<< ./snippets/groups/update.swift#example{swift} [Swift]
:::

## delete(groupType, groupId)

Delete a group. Both JS and Swift return `{ success: boolean }`.

::: code-group
<<< ./snippets/groups/delete.ts#example{ts} [JavaScript]
<<< ./snippets/groups/delete.swift#example{swift} [Swift]
:::

## listMembers(groupType, groupId, options?)

List the members of a group, with optional `limit` / `cursor` pagination.

Swift takes a typed `PaginationOptions` and returns a typed
`PaginatedResult<GroupMemberInfo>` (`{ items, cursor? }`), matching JS.

::: code-group
<<< ./snippets/groups/list-members.ts#example{ts} [JavaScript]
<<< ./snippets/groups/list-members.swift#example{swift} [Swift]
:::

## addMember(groupType, groupId, params)

Add a user to a group by `userId` **or** `email` (mutually exclusive).

Both clients return a discriminated union (`GroupAddMemberResult`) keyed on
`status` — `"added"`, `"already_member"`, or `"pending_signup"` (a deferred add
for an email with no app user yet, carrying `deferredId` / `inviteToken` /
`expiresAt`). In Swift, switch over `.direct(DirectGroupAdd)` /
`.deferred(DeferredGroupAdd)`. Build `params` with the `.userId(_:)` /
`.email(_:)` factories on `AddGroupMemberParams`
([#453](https://github.com/Primitive-Labs/js-bao-wss/issues/453),
[#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).

::: tip Mutual exclusivity
JS enforces the userId-XOR-email contract at compile time via a union type. In
Swift the `.userId(_:)` / `.email(_:)` factories make the choice exclusive by
construction.
:::

::: code-group
<<< ./snippets/groups/add-member.ts#example{ts} [JavaScript]
<<< ./snippets/groups/add-member.swift#example{swift} [Swift]
:::

## removeMember(groupType, groupId, userIdOrParams)

Remove a member. In JS this single method is overloaded to accept either a
`userId` string or `{ email }`. In Swift the method takes a `userId` only; the
email path is a separate `removeMemberByEmail` method (see below).

::: code-group
<<< ./snippets/groups/remove-member.ts#example{ts} [JavaScript]
<<< ./snippets/groups/remove-member.swift#example{swift} [Swift]
:::

## removeMemberByEmail(groupType, groupId, email)

::: warning Swift-only
Swift splits the email removal path into its own method. In JavaScript, call
`removeMember(groupType, groupId, { email })` on the single overloaded method
instead.
:::

<<< ./snippets/groups/remove-member-by-email.swift#example{swift} [Swift]

## listUserMemberships(userId, options?)

List every group a user belongs to.

::: code-group
<<< ./snippets/groups/list-user-memberships.ts#example{ts} [JavaScript]
<<< ./snippets/groups/list-user-memberships.swift#example{swift} [Swift]
:::

## listPendingInvitations(groupType, groupId)

List pending (unresolved, non-expired) invitations scoped to a group, so you
can render "members + pending" together without touching the internal
deferred-grants surface.

::: code-group
<<< ./snippets/groups/list-pending-invitations.ts#example{ts} [JavaScript]
<<< ./snippets/groups/list-pending-invitations.swift#example{swift} [Swift]
:::

## listDocuments(groupType, groupId)

List every document the group has access to, with the granted permission.

::: code-group
<<< ./snippets/groups/list-documents.ts#example{ts} [JavaScript]
<<< ./snippets/groups/list-documents.swift#example{swift} [Swift]
:::

## listDatabases(groupType, groupId)

List every database the group has access to (via `DatabaseGroupPermission`),
with the granted permission.

::: code-group
<<< ./snippets/groups/list-databases.ts#example{ts} [JavaScript]
<<< ./snippets/groups/list-databases.swift#example{swift} [Swift]
:::
