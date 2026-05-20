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

You can add members by **email** or by user ID. Most apps should use email — it's what your users know, and the server resolves it automatically.

```typescript
// Add a member by email (recommended for user-facing flows)
const result = await client.groups.addMember("team", "engineering", {
  email: "alice@example.com",
});

// Add a member by user ID (for internal/programmatic use)
await client.groups.addMember("team", "engineering", {
  userId: "user-456",
});

// List members
const members = await client.groups.listMembers("team", "engineering");

// List groups a user belongs to (each row includes `name` and optional `description`
// joined from the group; orphan rows are skipped)
const memberships = await client.groups.listUserMemberships(userId);
// [{ groupType, groupId, name, description?, addedAt, addedBy }]

// Filter to a single group type when you only need one slice
const teamMemberships = await client.groups.listUserMemberships(userId, {
  groupType: "team",
});
```

Provide **either** `email` or `userId`, not both.

The `addMember` result is a discriminated union — branch on `status`:

| `status` | Meaning |
|---|---|
| `"added"` | Email or userId mapped to an existing user; new membership row created |
| `"already_member"` | Existing member (idempotent — no error) |
| `"pending_signup"` | Email is not yet an app user; a deferred add was created. Carries `invitationId` and `inviteToken` for custom invitation emails |

See [Sharing and Invitations](./sharing-and-invitations.md#sending-your-own-invitation-emails) for what to do with `inviteToken`.

### Email-Based Adds Work for Non-Members Too

If the email you pass to `addMember` doesn't match an existing app user, the server creates an invitation and remembers the pending add. When that person signs up with that email, they're automatically added to the group.

This means you can onboard someone into the right team *before* they've created an account — and `isMemberOf` checks start working the moment they sign up, no admin action needed.

See [Sharing and Invitations](./sharing-and-invitations.md) for the full picture (invitation lifecycle, cascade on revoke, domain-mode re-validation).

::: warning CEL membership resolves at signup
`isMemberOf('team', 'engineering')` returns `false` for a pending (not-yet-signed-up) member until their signup completes. If a workflow or operation needs to act "as if" the person were already a member, wait until the `invitation`/`accepted` event fires.
:::

Via the CLI:

```bash
# Add a member
primitive groups add-member --group-id <groupId> --user-id <userId> --role member

# List members
primitive groups list-members --group-id <groupId>

# Update a member's role
primitive groups update-member --group-id <groupId> --user-id <userId> --role admin

# Remove a member by user ID
primitive groups remove-member --group-id <groupId> --user-id <userId>

# Remove by email — also cancels a pending deferred add if the user
# hasn't signed up yet
primitive groups remove-member --group-id <groupId> --email alice@example.com
```

### Group Roles

Members have a role within each group. Default roles are `member` and `admin`, but you can define custom roles in your group type configuration.

## Groups and Documents

Grant document access to an entire group instead of individual users:

```typescript
// Share a document with a group
await client.documents.grantGroupPermission(documentId, {
  groupType: "team",
  groupId: "engineering-team",
  permission: "read-write",
});
```

All members of the group receive the specified permission level. When membership changes, document access updates automatically.

## Groups and Databases

Use CEL functions to check group membership in database operation access expressions. The platform exposes three group-related helpers: `isMemberOf(groupType, groupId)` (two args, strict match), `memberGroups(groupType)` (returns the array of `groupId`s the caller belongs to), and `hasRole(role)` (checks the caller's app role — `"owner"`, `"admin"`, or `"member"`).

```toml
# Only members of the engineering team
access = "isMemberOf('team', 'engineering')"

# App-level admins or owners
access = "hasRole('admin') || hasRole('owner')"

# Members of any team
access = "size(memberGroups('team')) > 0"
```

### Common Access Patterns

**Team-based workspace access:**
```toml
# Users can only see records for teams they belong to
access = "params.teamId in memberGroups('team')"
params = [{ name = "teamId", type = "TEXT", required = true }]
```

**Role-based access (read vs. write):**
```toml
# App admins can edit; team members can view.
# Group-level "admin" isn't a built-in concept — model it as a separate
# group type (e.g. groupType: "team-admin") and check membership there.
[[types.operations]]
name = "update-settings"
access = "hasRole('admin') || hasRole('owner') || isMemberOf('team-admin', params.teamId)"

[[types.operations]]
name = "view-settings"
access = "isMemberOf('team', params.teamId)"
```

**Organization hierarchy:**
```toml
# Member of either the parent org or the team can access
access = "isMemberOf('org', params.orgId) || isMemberOf('team', params.teamId)"
```

## Rule Sets

Database operations use CEL expressions (like `isMemberOf('team', 'engineering')`) to control who can run a specific query or mutation. Rule sets serve a different purpose — they control who can perform **management operations** on platform resources like groups, collections, and database types.

For example, a rule set can define who is allowed to add or remove members from a group, or who can create new groups of a certain type:

```bash
primitive rule-sets create "team-management" \
  --resource-type group \
  --rules '{
    "group":  { "create": "true",                                                     "edit": "user.userId == group.createdBy", "delete": "user.userId == group.createdBy" },
    "member": { "create": "isMemberOf(group.groupType, group.groupId)",               "edit": "user.userId == group.createdBy", "delete": "user.userId == group.createdBy" }
  }'
```

Bind the rule set to a group type via a `GroupTypeConfig` — declare it in `config/group-type-configs/<type>.toml` and run `primitive sync push --dir ./config`, or call `client.groupTypeConfigs.create({ groupType, ruleSetId })` from the SDK. Collection rule sets work the same way — use `--resource-type collection` and bind via `client.collectionTypeConfigs` (or `config/collection-type-configs/<type>.toml`).

App owners and admins bypass rule-set evaluation entirely; rules apply to regular members. Group types with no config row fall back to permissive built-in defaults (any member can `create`; the creator can `edit`/`delete` and manage members; the creator and direct members can read). To **deny** an op for everyone except admins/owners, attach a rule set with that op set to `"false"` (or omit the rule set entirely on a `GroupTypeConfig` row to use that row as an explicit opt-out).

Rule sets are versioned and include built-in testing and debugging tools — you can evaluate rules against simulated requests with `client.ruleSets.test()` before deploying them.

## Best Practices

1. **Use groups for access control.** Groups integrate natively with documents (group permissions) and databases (CEL membership checks). They're the primary mechanism for authorization in Primitive.

2. **Define group types for each category.** Use separate group types for teams, roles, departments — this keeps your access control expressions clean.

3. **Prefer group membership checks over user ID checks.** `isMemberOf('team', params.teamId)` is more maintainable than `userId == 'specific-admin-id'`.

## Next Steps

- **[Sharing and Invitations](./sharing-and-invitations.md)** — Invitations, email-based shares, collections, access requests
- **[Working with Databases](./working-with-databases.md)** — Use groups in database access control
- **[Working with Documents](./working-with-documents.md)** — Share documents with groups
- **[Authentication](./authentication.md)** — How users get authenticated
