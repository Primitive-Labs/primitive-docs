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
| `appRole` | Legacy role field |
| `addedAt` | When the user joined |

::: warning Don't Duplicate
Never create your own "users" model in js-bao or databases that duplicates these fields. The platform user is your source of truth for identity. If you need additional user data (preferences, profile fields), store it separately and reference the platform `userId`.
:::

## Listing and Looking Up Users

```typescript
import { jsBaoClientService } from "primitive-app";

const client = await jsBaoClientService.getClientAsync();

// List all users in your app
const { users } = await client.users.list();

// Get a specific user
const user = await client.users.get(userId);

// Get the current user
const me = await client.users.me();
```

Via the CLI:

```bash
primitive users list
primitive users get --user-id <userId>
```

## Groups

Groups let you organize users into teams, roles, departments, or any relationship. They integrate with both document permissions and database access control.

### Creating Groups

```bash
# Create a group type (defines a category of groups)
primitive group-types create --name "team" --display-name "Teams"

# Create a group
primitive groups create --type "team" --name "engineering" --display-name "Engineering Team"
```

### Managing Members

You can add members by **email** or by user ID. Most apps should use email — it's what your users know, and the server resolves it to a user ID automatically.

```typescript
// Add a member by email (recommended for user-facing flows)
await client.groups.addMember("team", "engineering", {
  email: "alice@example.com",
});

// Add a member by user ID (for internal/programmatic use)
await client.groups.addMember("team", "engineering", {
  userId: "user-456",
});

// List members
const members = await client.groups.listMembers("team", "engineering");

// List groups a user belongs to
const memberships = await client.groups.listUserMemberships(userId);
```

Provide **either** `email` or `userId`, not both. The server returns `404` if the email doesn't match an existing user, or `409` if they're already a member.

Via the CLI:

```bash
# Add a member
primitive groups add-member --group-id <groupId> --user-id <userId> --role member

# List members
primitive groups list-members --group-id <groupId>

# Update a member's role
primitive groups update-member --group-id <groupId> --user-id <userId> --role admin

# Remove a member
primitive groups remove-member --group-id <groupId> --user-id <userId>
```

### Group Roles

Members have a role within each group. Default roles are `member` and `admin`, but you can define custom roles in your group type configuration.

## Groups and Documents

Grant document access to an entire group instead of individual users:

```typescript
// Share a document with a group
await client.documents.setGroupPermission(documentId, {
  groupId: "engineering-team",
  permission: "read-write",
});
```

All members of the group receive the specified permission level. When membership changes, document access updates automatically.

## Groups and Databases

Use CEL functions to check group membership in database operation access expressions:

```toml
# Only team members can access
access = "isMemberOf('engineering')"

# Only group admins
access = "hasGroupRole('engineering', 'admin')"

# Members of any team in the "team" group type
access = "size(memberGroups('team')) > 0"
```

### Common Access Patterns

**Team-based workspace access:**
```toml
# Users can only see records belonging to their teams
access = "isMemberOf(params.teamId)"
params = [{ name = "teamId", type = "TEXT", required = true }]
```

**Role-based access:**
```toml
# Managers can edit, members can view
# (use separate operations for read vs. write)
[[types.operations]]
name = "update-settings"
access = "hasGroupRole(params.teamId, 'admin')"

[[types.operations]]
name = "view-settings"
access = "isMemberOf(params.teamId)"
```

**Organization hierarchy:**
```toml
# Parent org admins can manage child teams
access = "hasGroupRole(params.orgId, 'admin') || hasGroupRole(params.teamId, 'admin')"
```

## Rule Sets

Database operations use CEL expressions (like `isMemberOf('engineering')`) to control who can run a specific query or mutation. Rule sets serve a different purpose — they control who can perform **management operations** on platform resources like groups, documents, workflows, and database types.

For example, a rule set can define who is allowed to add or remove members from a group, or who can create new groups of a certain type:

```bash
primitive rule-sets create --name "team-management" \
  --entity-type "group" \
  --rules '{
    "group": { "create": "true", "edit": "hasGroupRole(group.groupType, '\''admin'\'')", "delete": "hasGroupRole(group.groupType, '\''admin'\'')" },
    "member": { "create": "isMemberOf(group.groupType, group.groupId)", "edit": "hasGroupRole(group.groupType, '\''admin'\'')", "delete": "hasGroupRole(group.groupType, '\''admin'\'')" }
  }'
```

Rule sets are versioned and include built-in testing and debugging tools — you can evaluate rules against simulated requests before deploying them.

## Best Practices

1. **Use groups for access control.** Groups integrate natively with documents (group permissions) and databases (CEL membership checks). They're the primary mechanism for authorization in Primitive.

2. **Define group types for each category.** Use separate group types for teams, roles, departments — this keeps your access control expressions clean.

3. **Prefer group membership checks over user ID checks.** `isMemberOf('admin')` is more maintainable than `userId == 'specific-admin-id'`.

## Next Steps

- **[Working with Databases](./working-with-databases.md)** — Use groups in database access control
- **[Working with Documents](./working-with-documents.md)** — Share documents with groups
- **[Authentication](./authentication.md)** — How users get authenticated
