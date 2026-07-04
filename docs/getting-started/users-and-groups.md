# Users and Groups

Primitive provides a built-in user model and a flexible group system for access control. You don't need to build user tables or permission systems — the platform handles identity, and you layer on groups for authorization.

## The Platform User Model

Every authenticated user gets a profile managed by the platform:

| Field | Description |
|---|---|
| `userId` | Unique identifier |
| `email` | User's email address |
| `name` | Display name |
| `avatarUrl` | Profile picture URL |
| `appRole` | The user's app role (`owner`, `admin`, or `member`) |
| `addedAt` | When the user joined |

::: warning Don't Duplicate
Never create your own "users" model in js-bao or databases that duplicates these fields. The platform user is your source of truth for identity. If you need additional user data (preferences, profile fields), store it separately and reference the platform `userId`.
:::

## Listing and Looking Up Users

Look up users by id or email from the client. The current signed-in user lives on `client.me`.

::: code-group

<<< ../../examples/users-and-groups/users-lookup.ts#example{ts} [JavaScript]

<<< ../../examples/users-and-groups/users-lookup.swift#example{swift} [Swift]

:::

To list **all** users in your app, use the CLI or admin console:

```bash
primitive users list
primitive users list --search <userId-or-email-or-name>
```

## Groups

Groups let you organize users into teams, roles, departments, or any relationship. They integrate with both document permissions and database access control.

### Creating Groups

```bash
# Create a group type config (defines a category of groups)
primitive group-type-configs create --group-type team

# Create a group — omit --id and the server assigns one
primitive groups create --type team --id engineering --name "Engineering Team"
```

`--id` (`groupId` on the client) is optional — omit it and the server assigns a ULID, returned in the response, the same way documents and databases get their ids.

### Managing Members

You can add members by **email** or by user ID. Most apps should use email — it's what your users know, and the server resolves it automatically.

::: code-group

<<< ../../examples/users-and-groups/group-membership.ts#example{ts} [JavaScript]

<<< ../../examples/users-and-groups/group-membership.swift#example{swift} [Swift]

:::

The `addMember` result is a discriminated union — branch on `status`:

| `status` | Meaning |
|---|---|
| `"added"` | Email or userId mapped to an existing user; new membership row created |
| `"already_member"` | Existing member (idempotent — no error) |
| `"pending_signup"` | Email is not yet an app user; a deferred add was created. Carries `invitationId` and `inviteToken` for custom invitation emails |

See [Sending Your Own Invitation Emails](./invitations.md#sending-your-own-invitation-emails) for what to do with `inviteToken`.

Via the CLI:

```bash
# Add a member
primitive groups members add <group-type> <group-id> <user-id>

# List members
primitive groups members list <group-type> <group-id>

# Remove a member
primitive groups members remove <group-type> <group-id> <user-id>
```

These CLI commands take user IDs. The client's `addMember` (above) also accepts email addresses and handles the pending-signup case.

## Groups and Documents

Grant document access to an entire group instead of individual users:

::: code-group

<<< ../../examples/users-and-groups/grant-group-document.ts#example{ts} [JavaScript]

<<< ../../examples/users-and-groups/grant-group-document.swift#example{swift} [Swift]

:::

All members of the group receive the specified permission level, and access tracks membership automatically. See [Sharing Documents](./working-with-documents.md#sharing-documents) for the full grant API and the members-and-pending view.

## Groups in Access Rules

Groups are the workhorse of [access control](./access-control.md): server-side access rules check membership with `isMemberOf(groupType, groupId)`, `memberGroups(groupType)`, and `hasRole(role)` instead of hard-coding user IDs:

```toml novalidate
# Only members of the engineering team
access = "isMemberOf('team', 'engineering')"

# Users can only see records for teams they belong to
access = "params.teamId in memberGroups('team')"

# Member of either the parent org or the team
access = "isMemberOf('org', params.orgId) || isMemberOf('team', params.teamId)"
```

Who can *manage* groups themselves — create groups of a type, add or remove members — is governed by **rule sets** bound to the group type. See [Access Control](./access-control.md#rule-sets-governing-management-operations).

A group type (or collection type) can also declare [resource metadata](./resource-metadata.md) categories, making `md.self.<category>.<key>` available in that type's rule set — along with a reserved `attrs` category projecting the group's own `groupType`, `groupId`, `name`, and `createdBy` (a collection's `attrs` also includes `contextId`).

## Best Practices

1. **Use groups for access control.** Groups integrate natively with documents (group permissions) and databases (CEL membership checks). They're the primary mechanism for authorization in Primitive.

2. **Define group types for each category.** Use separate group types for teams, roles, departments — this keeps your access control expressions clean.

3. **Prefer group membership checks over user ID checks.** `isMemberOf('team', params.teamId)` is more maintainable than `userId == 'specific-admin-id'`.

## Next Steps

- **[Access Control](./access-control.md)** — The CEL rules your groups plug into
- **[Resource Metadata](./resource-metadata.md)** — Attach schema'd, access-controlled data to a group or collection
- **[Invitations](./invitations.md)** — App membership and deferred grants for not-yet-users
- **[Working with Documents](./working-with-documents.md)** — Share documents with groups
- **[Authentication](./authentication.md)** — How users get authenticated
