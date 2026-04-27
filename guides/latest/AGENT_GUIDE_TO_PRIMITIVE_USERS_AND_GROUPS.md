# Users, Groups, and Access Control in Primitive

Guidelines for modeling user relationships and managing access control with Primitive's built-in user system and groups.

## Core Concept: Built-in User Model

Primitive provides a built-in user model that every app should leverage. **Do not reinvent user identity.** The platform manages user accounts, authentication, and basic profile information — your app builds on top of this.

### What the platform provides

Every authenticated user has:

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Globally unique identifier (ULID) |
| `email` | string | Unique email address |
| `name` | string | Display name |
| `avatarUrl` | string | Profile picture URL |
| `appRole` | string | Role in the current app: `"owner"`, `"admin"`, or `"member"` |
| `addedAt` | string | When the user joined the app |

Access this via the client:

```typescript
const user = await client.users.getBasic(userId);
// { userId, email, name, avatarUrl, appRole, appId, addedAt }
```

The result is cached (5-minute default TTL) to avoid redundant network calls.

### Supplementing user data — not replacing it

For app-specific user data (preferences, settings, profile fields beyond name/email/avatar), extend the platform user rather than creating a parallel user model:

**Do this:**

```typescript
// Store additional user data in a document, keyed by the platform userId
const userProfile = new UserProfile();
userProfile.userId = platformUserId; // reference the platform user
userProfile.bio = "Software engineer";
userProfile.theme = "dark";
await userProfile.save({ targetDocument: userDocumentId });

// Or in a database via registered operation
await client.databases.executeOperation(dbId, "updateProfile", {
  params: { bio: "Software engineer", theme: "dark" },
  // The operation uses $user.userId server-side — no need to pass userId
});
```

**Don't do this:**

```typescript
// DON'T create a separate user model that duplicates platform fields
const user = new AppUser();
user.email = "alice@example.com"; // Already managed by platform
user.name = "Alice";              // Already managed by platform
user.id = generateNewId();        // Use platform userId instead
```

### When to store additional user data

| Storage | Use case |
|---------|----------|
| **Root document** | Personal settings, preferences (auto-created per user, never shared) |
| **User's document** | App-specific profile data that follows document sharing rules |
| **Database** | User metadata visible to other users (e.g., public profile, reputation score) accessed via operations with `$user.userId` |

### Looking up users

```typescript
// Get a specific user's basic info (cached with 5-minute default TTL)
const info = await client.users.getBasic(userId);
// { userId, email, name, avatarUrl, appRole, appId, addedAt }
```

The `UsersAPI` only exposes `getBasic(userId)`. There is no `list()`, `get()`, or `me()` method on the client. To list users or look up by email, use the CLI:

```bash
primitive users list
primitive users get --user-id <userId>
```

### App roles (legacy)

Every user has one of three built-in roles: `owner`, `admin`, or `member`. However, **prefer groups over app roles** for modeling access in your application. Groups are more flexible (a user can belong to many groups in different contexts) and map cleanly to your domain (e.g., `team/engineering`, `role/reviewer`).

The main effect of app roles today:
- **`owner`** and **`admin`** users bypass group rule evaluation and have full management access
- **`member`** is the default — access is determined by group memberships

Use groups for all application-level role modeling (editor, viewer, moderator, etc.) rather than relying on the `admin`/`member` distinction.

## Core Concept: Groups

Groups organize users and control access to documents and databases. Instead of granting permissions to individual users, grant access to a group and all members inherit it.

Groups are identified by a `(groupType, groupId)` pair, allowing multiple taxonomies:
- `team/engineering` — team membership
- `department/sales` — organizational unit
- `role/reviewer` — functional role
- `class/math-101` — context-specific grouping
- `parent-of/student-123` — relationship modeling

### Quick start

```typescript
// 1. Create a group
await client.groups.create({
  groupType: "team",
  groupId: "engineering",
  name: "Engineering Team",
});

// 2. Add members
await client.groups.addMember("team", "engineering", { userId: "user-456" });
await client.groups.addMember("team", "engineering", { email: "bob@example.com" });

// 3. Grant group access to a document
await client.documents.grantGroupPermission(documentId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write",
});

// 4. Use in database CEL access expressions
// access: "isMemberOf('team', database.metadata.teamId)"
```

## Managing Groups

### Create

```typescript
await client.groups.create({
  groupType: "team",
  groupId: "engineering",
  name: "Engineering Team",
  description: "Platform engineering team", // optional
});
```

If the group type has `autoAddCreator: true` (default), the creator is automatically added as a member.

### List

`groups.list()` returns a paginated result with `{ items, cursor }`.

```typescript
// All groups (paginated)
const result = await client.groups.list();
// result: { items: GroupInfo[], cursor?: string }

// Filter by type
const teamResult = await client.groups.list({ type: "team" });

// Paginate through results
const page1 = await client.groups.list({ type: "team", limit: 10 });
const page2 = await client.groups.list({ type: "team", limit: 10, cursor: page1.cursor });
```

### Get / Update / Delete

```typescript
const group = await client.groups.get("team", "engineering");

await client.groups.update("team", "engineering", {
  name: "Platform Engineering",
});

// Cascade-deletes all memberships and group permissions
await client.groups.delete("team", "engineering");
```

## Managing Members

### Add members

```typescript
// By user ID — immediate
await client.groups.addMember("team", "engineering", { userId: "user-456" });

// By email — immediate if the user exists, deferred if they don't
const result = await client.groups.addMember("team", "engineering", {
  email: "alice@example.com",
});
```

The result is a discriminated union — `DirectGroupAdd | DeferredGroupAdd`:

```typescript
// DirectGroupAdd
// { status: "added" | "already_member",
//   userId, userName?, userEmail?, addedAt, addedBy }

// DeferredGroupAdd
// { status: "pending_signup",
//   email, appInvitationCreated, deferredId, expiresAt,
//   groupType, groupId,
//   invitationId, inviteToken }
```

Branch on `status`:

- `"added"` — new membership row created.
- `"already_member"` — idempotent no-op; the response carries the existing row's `addedAt` / `addedBy`. **Replaces the old `409` error**.
- `"pending_signup"` — email is not yet an app user. The server created an `AppInvitation` + `DeferredGroupAdd`. Use `invitationId` + `inviteToken` to send a custom invitation email; the platform-default email is sent automatically unless the original invitation was created with `sendEmail: false`.

Until a deferred add resolves, `isMemberOf` returns false for that email's user — do not assume membership before the acceptance event.

Provide either `userId` or `email`, not both.

See the [Sharing and Invitations guide](AGENT_GUIDE_TO_PRIMITIVE_SHARING_AND_INVITATIONS.md) for the full deferred-grant lifecycle and the token-based acceptance path.

### List members

```typescript
const members = await client.groups.listMembers("team", "engineering");
// [{ userId, userName, userEmail, addedAt, addedBy }]
```

### Remove members

```typescript
// By user ID
await client.groups.removeMember("team", "engineering", "user-456");

// By email — handles both "is currently a member" AND "was invited but
// hasn't signed up yet". If a direct membership exists, it's removed.
// Otherwise the pending DeferredGroupAdd for that email is canceled.
await client.groups.removeMember("team", "engineering", { email: "alice@example.com" });
```

The email form is the right call when you don't know — and don't want to branch on — whether the target has signed up yet. Revoke the whole `AppInvitation` only when you want to cancel **every** grant attached to it (group add, document share, app-join right) at once.

### List pending invitations for a group

```typescript
const pending = await client.groups.listPendingInvitations("team", "engineering");
// [{ email, role, invitationId, createdAt, expiresAt, addedBy? }]
```

Use this to render the "pending members" section of a group sharing UI without touching the internal `client.deferredGrants.*` surface.

### List a user's memberships

```typescript
const memberships = await client.groups.listUserMemberships("user-456");
// [{ groupType, groupId, name, description?, addedAt, addedBy }]
//
// `name` is joined from AppGroup at call time.
// Orphan rows (membership pointing at a deleted group) are skipped.

// Filter to a single group type — server-side SK-range push-down,
// not a post-query JS filter.
const teams = await client.groups.listUserMemberships("user-456", {
  groupType: "team",
});
```

## Group Type Configuration

Group types are configured via TOML config files and the `primitive sync` command. This keeps configuration version-controlled alongside your code.

**File:** `config/group-type-configs/team.toml`

```toml
[groupTypeConfig]
groupType = "team"
ruleSetName = "team-rules"     # optional — rule set for group management
autoAddCreator = true          # auto-add creator as member (default: true)
```

Push to the server:

```bash
primitive sync push --dir ./config
```

See the [Databases guide](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md#configuring-with-the-cli) for full details on the sync workflow (`init`, `pull`, `diff`, `push`).

## Groups and Documents

Grant a group access to a document. All members inherit the permission.

```typescript
// Grant access
await client.documents.grantGroupPermission(documentId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write", // or "reader"
});

// List group permissions on a document
const groupPerms = await client.documents.listGroupPermissions(documentId);

// Revoke
await client.documents.revokeGroupPermission(documentId, "team", "engineering");

// List documents a group has access to
const docs = await client.groups.listDocuments("team", "engineering");
```

**Permission resolution:** A user's effective permission on a document is the **highest** across their direct permission and all group memberships. For example, if a user has `reader` direct access but their team has `read-write`, they get `read-write`.

## Groups and Databases

Databases don't have group permission grants. Instead, group memberships are checked in **CEL access expressions** on registered operations. See the [Databases guide](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md) for how to register operations.

**CEL functions for groups:**

| Function | Returns | Description |
|----------|---------|-------------|
| `isMemberOf(groupType, groupId)` | bool | Whether the caller belongs to the group |
| `memberGroups(groupType)` | string[] | All group IDs the caller belongs to for the type |
| `hasRole(role)` | bool | Whether the caller's app role matches (e.g., `"owner"`, `"admin"`, `"member"`) |

**Common CEL patterns for database operations:**

```
// Team members of the database's team
access: "isMemberOf('team', database.metadata.teamId)"

// Any team member (team ID passed as parameter)
access: "isMemberOf('team', params.teamId)"

// User can only query groups they belong to
access: "params.teamId in memberGroups('team')"

// Per-parameter access: parent can only view their child's data
params: {
  studentId: {
    type: "string",
    required: true,
    access: "value in memberGroups('parent-of')"
  }
}
```

## Rule Sets for Group Management

Rule sets control who can create, edit, delete groups and manage members. They use CEL expressions evaluated against the requesting user and target group.

### Defining a rule set

Rule sets are defined in TOML config files:

**File:** `config/rule-sets/team-rules.toml`

```toml
[ruleSet]
name = "team-rules"
resourceType = "group"
description = "Controls who can manage team groups and members"

[rules.group]
create = "false"                                              # only owners/admins (they bypass rules)
edit = "isMemberOf(group.groupType, group.groupId)"
delete = "false"                                              # only owners/admins
list = "true"                                                 # everyone can list

[rules.member]
create = "isMemberOf(group.groupType, group.groupId)"         # members can add
delete = "user.userId == target.userId"                       # members can remove themselves
list = "true"
```

### Attaching to a group type

Reference the rule set by name in the group type config:

**File:** `config/group-type-configs/team.toml`

```toml
[groupTypeConfig]
groupType = "team"
ruleSetName = "team-rules"
autoAddCreator = true
```

Push both configs:

```bash
primitive sync push --dir ./config
```

### Rule CEL context

| Variable | Description |
|----------|-------------|
| `user.userId` | The requesting user's ID |
| `user.role` | The requesting user's app role |
| `group.groupType` | The target group's type |
| `group.groupId` | The target group's ID |
| `group.name` | The target group's name |
| `group.createdBy` | Who created the group |
| `target.userId` | The target user (for member operations) |

App owners and admins always bypass rule evaluation.

### Testing rules

You can test a rule set's evaluation at runtime:

```typescript
const result = await client.ruleSets.test(ruleSetId, {
  category: "group",
  operation: "create",
  user: { userId: "user-123", role: "member" },
  memberships: [{ groupType: "team", groupId: "engineering" }], // optional
  group: { groupType: "team", groupId: "engineering", name: "Eng", createdBy: "user-456" }, // optional
});
```

You can also debug rule evaluation for a real user (returning the full evaluation trace):

```typescript
const debugResult = await client.ruleSets.debug({
  userId: "user-123",
  groupType: "team",
  groupId: "engineering",
  category: "member",
  operation: "create",
});
```

To update rule sets, edit the TOML file and run `primitive sync push --dir ./config`.

## Common Patterns

For full app architecture examples showing how groups fit alongside documents and databases, see the [Data Modeling guide](AGENT_GUIDE_TO_PRIMITIVE_DATA_MODELING.md#example-app-architectures).

### Team-based workspace access

Users create teams. Team members get access to team documents and databases.

**Setup** (via CLI config):

**File:** `config/group-type-configs/team.toml`

```toml
[groupTypeConfig]
groupType = "team"
autoAddCreator = true
```

**Runtime** (in app code):

```typescript
// User creates a team
await client.groups.create({
  groupType: "team",
  groupId: "alpha-team",
  name: "Alpha Team",
});

// Share a document with the team
await client.documents.grantGroupPermission(docId, {
  groupType: "team",
  groupId: "alpha-team",
  permission: "read-write",
});

// Database operations gated by team membership
// access: "isMemberOf('team', database.metadata.teamId)"
```

### Role-based access (reviewer, editor, viewer)

Use group types as roles within a context.

```typescript
// Create role groups for a project
await client.groups.create({ groupType: "editor", groupId: "project-1", name: "Project 1 Editors" });
await client.groups.create({ groupType: "viewer", groupId: "project-1", name: "Project 1 Viewers" });

// Grant different document permissions
await client.documents.grantGroupPermission(docId, {
  groupType: "editor", groupId: "project-1", permission: "read-write",
});
await client.documents.grantGroupPermission(docId, {
  groupType: "viewer", groupId: "project-1", permission: "reader",
});

// Database operations with role checks
// Editors can modify:
// access: "isMemberOf('editor', params.projectId)"
// Viewers can read:
// access: "isMemberOf('viewer', params.projectId) || isMemberOf('editor', params.projectId)"
```

### Relationship modeling (parent-child, mentor-mentee)

Use groups to model relationships between users.

**Setup** (via CLI config):

**File:** `config/database-types/classroom.toml` (excerpt)

```toml
[[operations]]
name = "viewGrades"
type = "query"
modelName = "grades"
access = "true"
definition = '{"filter":{"studentId":"$params.studentId"},"sort":{"date":-1}}'
params = '{"studentId":{"type":"string","required":true,"access":"value in memberGroups(\'parent-of\')"}}'
```

The per-parameter `access` expression ensures parents can only view their own children's grades.

**Runtime** (in app code):

```typescript
// A "parent-of" group per student
await client.groups.create({
  groupType: "parent-of",
  groupId: "student-123",
  name: "Parents of Student 123",
});
await client.groups.addMember("parent-of", "student-123", { userId: parentUserId });

// Parent queries their child's grades — server enforces access
const grades = await client.databases.executeOperation(dbId, "viewGrades", {
  params: { studentId: "student-123" },
});
```

### Organization hierarchy

Model nested organizational structure with multiple group types.

```typescript
// Organization-level groups
await client.groups.create({ groupType: "org", groupId: "acme-corp", name: "Acme Corp" });

// Department-level groups
await client.groups.create({ groupType: "dept", groupId: "engineering", name: "Engineering" });
await client.groups.create({ groupType: "dept", groupId: "marketing", name: "Marketing" });

// Team-level groups
await client.groups.create({ groupType: "team", groupId: "backend", name: "Backend Team" });

// A user can be in multiple groups at different levels
await client.groups.addMember("org", "acme-corp", { userId });
await client.groups.addMember("dept", "engineering", { userId });
await client.groups.addMember("team", "backend", { userId });

// CEL can check any level:
// "isMemberOf('org', database.metadata.orgId)"
// "isMemberOf('dept', params.deptId)"
// "isMemberOf('team', database.metadata.teamId)"
```

## Best Practices

### Users

- **Always use the platform user model** for identity. Reference `userId` from the platform, don't generate your own user IDs.
- **Use `client.users.getBasic()`** to display user info (name, avatar, email). It caches results automatically.
- **Store supplemental user data** in the root document (personal settings) or in a database (public profile data accessible via operations).
- **Don't duplicate platform fields.** Name, email, and avatar are managed by the platform — read them from there.

### Groups

- **Choose meaningful group types.** Use types that map to your domain: `team`, `class`, `department`, `parent-of`. The `groupType` is the taxonomy, the `groupId` is the instance.
- **Use `autoAddCreator: true`** (default) for groups where the creator should be a member (teams, clubs). Set to `false` for groups managed by admins (classes, departments).
- **Prefer groups over per-user grants** for document access. Easier to manage and audit.
- **Use CEL `isMemberOf()` for database access** rather than trying to grant database permissions to individual users.

### Access control

- **App owners and admins bypass all group rules.** Design CEL expressions for regular members — don't try to restrict owners/admins via rules.
- **Use per-parameter access** for sensitive relationships (parent-child, manager-report).
- **Keep rule sets simple.** Complex nested CEL expressions are hard to debug. Prefer multiple focused operations over one operation with complex access logic.
- **Test rules** with `client.ruleSets.test()` before deploying, and use `client.ruleSets.debug()` to trace evaluation for real users.

## Common Errors

| Symptom | Cause | Fix |
|---------|-------|-----|
| 409 on addMember | User is already a member | Check membership before adding, or handle the conflict |
| `addMember` by email returns `status: "pending_signup"` | Email isn't an app user yet | Expected — membership resolves when they sign up or accept via token; show a pending UI |
| `addMember` returns `status: "already_member"` | The user was already a member | Idempotent — no error; replaces the previous `409` response |
| 403 on group create | Group type has a rule set that denied the operation | Check the `group.create` rule; admins/owners bypass rules |
| Group permission not taking effect on document | User hasn't reopened the document | Close and reopen the document to pick up new group permissions |
| CEL `isMemberOf` returns false | User not added to the group, or wrong groupType/groupId | Verify membership with `listUserMemberships` |
| Can't restrict admin access via rules | By design — admins bypass rule evaluation | Use app roles for broad access, groups for fine-grained |
