# Users, Groups, and Access Control in Primitive

Guidelines for modeling user relationships and managing access control with Primitive's built-in user system and groups.

## Core Concept: Built-in User Model

Primitive provides a built-in user model that every app should leverage. **Do not reinvent user identity.** The platform manages user accounts, authentication, and basic profile information — your app builds on top of this.

### What the platform provides

`client.users.getBasic(userId)` returns a `BasicUserInfo`:

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Globally unique identifier (ULID) |
| `email` | string | Unique email address |
| `name` | string | Display name |
| `avatarUrl` | string \| undefined | Profile picture URL |
| `appRole` | string | Role in the current app: `"owner"`, `"admin"`, or `"member"` |
| `appId` | string | The app the user belongs to |
| `addedAt` | string \| undefined | When the user joined the app |

```typescript
const user = await client.users.getBasic(userId);
// Cached with 5-minute default TTL. Override via options:
const fresh = await client.users.getBasic(userId, { refreshNetwork: true });
```

`GetUserOptions` knobs: `refreshIfOlderThanMs`, `waitForLoad` (`"local" | "network" | "localIfAvailableElseNetwork"`), `refreshNetwork`, `serverTimeoutMs`.

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
// Single user — cached
const info = await client.users.getBasic(userId);

// Many users in one call (max 100). Returns only users that exist + belong to the app.
const profiles = await client.users.getProfiles([userIdA, userIdB]);
// [{ userId, email, name: string | null, avatarUrl: string | null }]

// Look up a user by email in the current app.
const result = await client.users.lookup("alice@example.com");
// { exists: true, user: { userId, name, email } } | { exists: false }
```

There is no `list()` or `get()` method on `client.users`. The current authenticated user lives on a separate namespace: `client.me.get()` returns the current user's profile (cached, with the same `GetUserOptions` knobs). To enumerate every user in the app, use the CLI:

```bash
primitive users list
```

### App roles

Every user has one of three built-in roles: `"owner"`, `"admin"`, or `"member"` (default). **Prefer groups over app roles** for application-level role modeling — groups are multi-tenant by context (a user can be `editor` in one project, `viewer` in another) while app roles are global per-app.

Behavior:
- **`owner`** and **`admin`** users **bypass all rule-set evaluation** for groups, collections, and database type rules (see `evaluateRule` in `cel-resource-registry.ts`). Do not try to restrict them via rules.
- **`member`** is the default — access is determined by direct permissions and group memberships.
- In CEL rule contexts the field is `user.role` (NOT `user.appRole`). See [Rule CEL context](#rule-cel-context) below.

## Current User: `client.me`

The current authenticated user has its own namespace. Use it for "me"-scoped reads and writes — profile, avatar, the user's view of shared documents, pending document invitations, and the generic bookmarks store.

### Profile

```typescript
const profile = await client.me.get();
// { userId, email, name, appRole, appId, avatarUrl? } | null when signed out

await client.me.get({
  waitForLoad: "localIfAvailableElseNetwork", // | "local" | "network"
  refreshIfOlderThanMs: 60_000,               // default 5 minutes
  refreshNetwork: true,                       // bypass cache once
  serverTimeoutMs: 5_000,                     // soft network timeout
});

await client.me.update({
  name: "Alice Reyes",
  avatarUrl: "https://cdn.example.com/u/alice.png", // pass null to clear
});

// Upload an image directly (server hosts it and returns a URL)
const { avatarUrl } = await client.me.uploadAvatar(
  fileFromInput,
  "image/png" // also "image/jpeg" | "image/gif" | "image/webp"
);
```

`get()` is cache-backed; `update()` and `uploadAvatar()` clear that cache automatically. Reach for the cache controls if you need to override:

```typescript
await client.me.cacheInfo();   // { updatedAt?, ageMs? }
await client.me.clearCache();  // forces the next get() to hit the network
```

### Documents view

```typescript
// Documents shared with the current user — direct grants AND pending
// invitations to documents. Includes title, permission level, who granted
// it, and a `source: "permission" | "invitation"` discriminator.
const { documents, nextCursor } = await client.me.sharedDocuments({
  limit: 50,
  cursor: prevCursor, // for pagination; nextCursor === null when exhausted
});

// Document invitations the user can accept — convenient for an inbox view.
const pending = await client.me.pendingDocumentInvitations();
// [{ invitationId, documentId, title?, email, permission,
//    invitedAt, invitedBy, expiresAt?, accepted, document?: {...} }, ...]
```

Use `me.sharedDocuments()` (not bookmark filtering) for "shared with me" UI — it resolves access via every path and includes shares the user hasn't bookmarked.

### Bookmarks (`client.me.bookmarks`)

Generic per-user references to any target type — documents, databases, collections, or anything the app wants to organize. Documents auto-bookmark on creation and on accepting an invitation; everything else is opt-in.

```typescript
// Add — `key` defaults to `${targetObjType}/${targetObjId}`. Idempotent:
// re-adding returns status: "already_bookmarked" with the original
// `bookmarkedAt`.
const { status, key, bookmarkedAt } = await client.me.bookmarks.add({
  targetObjType: "document",
  targetObjId: documentId,
  key: "projects/acme/q2-planning", // optional; hierarchical keys enable prefix queries
});

// Remove by key
await client.me.bookmarks.remove("projects/acme/q2-planning");

// Rename a key (move under a new prefix, etc.)
await client.me.bookmarks.rename(
  "projects/acme/q2-planning",
  "archived/acme/q2-planning"
);

// List with optional prefix + cursor pagination
const { bookmarks, nextCursor } = await client.me.bookmarks.list({
  prefix: "projects/acme/", // optional; matches by key prefix
  limit: 50,
});
```

Design notes:

- Use **hierarchical keys** (`folder/subfolder/leaf`) so prefix queries cheap-render folder views.
- Don't use bookmarks to drive a "shared with me" UI — they miss shares the user never bookmarked. Use `me.sharedDocuments()` for that.
- Bookmarks are private to each user; there is no "shared bookmark" surface.

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

`ListGroupsOptions` also supports `includeSystem: true` to include platform-managed internal groups whose `groupType` is prefixed with `_` (e.g. `_col-reader`/`_col-writer` backing collection sharing). These are filtered out by default — only set `includeSystem` for admin tooling.

### Get / Update / Delete

```typescript
const group = await client.groups.get("team", "engineering");
// { appId, groupType, groupId, name, description?, memberCount,
//   createdAt, createdBy, modifiedAt }

// Update name and/or description (both optional)
await client.groups.update("team", "engineering", {
  name: "Platform Engineering",
  description: "Owns the platform stack",
});

// Cascade-deletes all memberships and group permissions
await client.groups.delete("team", "engineering");
```

## Managing Members

### Add members

```typescript
// By user ID — always direct
await client.groups.addMember("team", "engineering", { userId: "user-456" });

// By email — direct if the email maps to an app user, deferred otherwise
const result = await client.groups.addMember("team", "engineering", {
  email: "alice@example.com",
});
```

`AddGroupMemberParams` is a discriminated union — pass **either** `userId` or `email`, never both. The TS types enforce this.

`addMember` returns `DirectGroupAdd | DeferredGroupAdd` — branch on `status`:

```typescript
const result = await client.groups.addMember("team", "engineering", { email });

if (result.status === "added") {
  // New membership created. result: { userId, userName?, userEmail?, addedAt, addedBy }
} else if (result.status === "already_member") {
  // Idempotent no-op. addedAt/addedBy reflect the pre-existing row.
  // Replaces the old HTTP 409 response.
} else if (result.status === "pending_signup") {
  // Email not yet an app user. Server created an AppInvitation +
  // DeferredGroupAdd. result: { email, appInvitationCreated, deferredId,
  //   expiresAt, groupType, groupId, invitationId, inviteToken }
  // Use inviteToken to build your own accept URL; the platform's default
  // email is sent unless the underlying invitation was created with sendEmail: false.
  // Cancel a pending add via:
  //   client.invitations.revokeDeferredGrant(result.deferredId, "group")
}
```

Until a deferred add resolves, `isMemberOf` returns false for that email's user — do not assume membership before sign-up/accept.

**Don't do this:**

```typescript
// BAD — mixing userId and email is rejected by the type system AND the server
await client.groups.addMember("team", "engineering", {
  userId: "user-456",
  email: "alice@example.com",
});

// BAD — assuming the result is always direct. If the email isn't an app user
// yet, result.userId is undefined.
const r = await client.groups.addMember("team", "engineering", { email });
console.log(r.userId); // TypeError when r.status === "pending_signup"
```

See the [Sharing and Invitations guide](AGENT_GUIDE_TO_PRIMITIVE_SHARING_AND_INVITATIONS.md) for the full deferred-grant lifecycle and the token-based acceptance path.

### List members

```typescript
// Paginated — { items, cursor? }
const page = await client.groups.listMembers("team", "engineering");
// page.items: [{ userId, userName?, userEmail?, addedAt, addedBy }]

// Pagination
const next = await client.groups.listMembers("team", "engineering", {
  limit: 50,
  cursor: page.cursor,
});
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

Use this to render the "pending members" section of a group sharing UI without having to filter the lower-level `client.invitations.listDeferredGrants()` surface.

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

Group types are configured via TOML config files and the `primitive sync` command (version-controlled alongside your code).

**File:** `config/group-type-configs/team.toml`

```toml
[groupTypeConfig]
groupType = "team"
ruleSetName = "team-rules"     # optional — name of an attached rule set
autoAddCreator = true          # auto-add creator as member when the config exists (default: true)
```

Push to the server:

```bash
primitive sync push --dir ./config
```

**Defaults & gotchas:**
- `autoAddCreator` defaults to `true` **only when a `GroupTypeConfig` row exists** for the type. With **no config row at all**, no auto-add happens.
- A group type with **no config** (or config with no `ruleSetName`) is **admin/owner-only** for non-admins — `groups.create`/`update`/`delete`/`addMember` all return 403, and `groups.list` filters that type out for member-role callers. Attach a rule set to make the type usable by regular members.

See the [Databases guide](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md#configuring-with-the-cli) for the full sync workflow (`init`, `pull`, `diff`, `push`).

## Groups and Documents

Grant a group access to a document. All members inherit the permission.

```typescript
// Grant access — permission is "read-write" or "reader" (NOT "write" or "view")
await client.documents.grantGroupPermission(documentId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write",
});

// List group permissions on a document
const groupPerms = await client.documents.listGroupPermissions(documentId);

// Revoke
await client.documents.revokeGroupPermission(documentId, "team", "engineering");

// List documents a group has access to
const docs = await client.groups.listDocuments("team", "engineering");

// And databases
const dbs = await client.groups.listDatabases("team", "engineering");
```

**Permission resolution:** A user's effective permission on a document is the **highest** across their direct permission and all group memberships. If a user has `reader` direct access but their team has `read-write`, they get `read-write`.

## Groups and Databases

Databases support a coarse-grained group grant — `client.databases.grantGroupPermission(databaseId, { groupType, groupId, permission: "manager" })` — that gives every member of the group `manager`-level access (the database's admin permission, the only level supported for groups). For everything else — gating individual queries and mutations — group memberships are checked in **CEL access expressions** on registered operations. See the [Databases guide](AGENT_GUIDE_TO_PRIMITIVE_DATABASES.md) for how to register operations.

**CEL functions available in every context:**

| Function | Returns | Description |
|----------|---------|-------------|
| `isMemberOf(groupType, groupId)` | bool | True if the caller has a membership matching exactly that `(groupType, groupId)` pair |
| `memberGroups(groupType)` | string[] | All `groupId`s the caller belongs to for the given type. Empty array if none. |
| `hasRole(role)` | bool | True if `user.role` equals the argument (`"owner"`, `"admin"`, or `"member"`) |
| `now()` | string | Current ISO-8601 timestamp |
| `fromWorkflow()` | bool | True if the call originates inside a workflow step |
| `fromWorkflow(key)` | bool | True if inside a workflow whose `workflowKey` matches |

**Database operation `access` CEL context:**

| Variable | Notes |
|----------|-------|
| `user.userId` | Caller's userId |
| `user.role` | `"owner"` / `"admin"` / `"member"` — NOT `user.appRole` |
| `database.id` | The database ID |
| `database.metadata.*` | The database's `metadata` JSON object |
| `params.*` | The operation's caller-supplied params |
| `secrets.*` | App secrets (only loaded if expression references `secrets.`) |
| `now` | ISO-8601 timestamp |
| `workflow` | Workflow context object when called from a workflow step (else `null`) |

**Common CEL patterns for database operations:**

```
// Team members of the database's team
access: "isMemberOf('team', database.metadata.teamId)"

// Team ID passed as parameter — caller must belong to that team
access: "isMemberOf('team', params.teamId)"

// User can only query groups they belong to (containment check)
access: "params.teamId in memberGroups('team')"

// Per-parameter access: parent can only view their own child's data
params: {
  studentId: {
    type: "string",
    required: true,
    access: "value in memberGroups('parent-of')"
  }
}

// Allow only when called from a specific workflow
access: "fromWorkflow('grade-import')"
```

**Don't do this — common CEL footguns:**

```
// BAD — `user.appRole` does not exist in CEL. Use `user.role` or hasRole().
access: "user.appRole == 'admin'"

// GOOD — checks the caller's app role.
access: "hasRole('admin') || hasRole('owner')"
// (Note: admins/owners bypass *rule-set* evaluation for groups/collections,
// but database operation `access` CEL is NOT bypassed. You must allow them
// explicitly if you want them in.)

// BAD — isMemberOf returns bool, not the group. `==` is meaningless.
access: "isMemberOf('team') == params.teamId"

// GOOD
access: "isMemberOf('team', params.teamId)"

// BAD — memberGroups returns an array, can't compare with ==.
access: "memberGroups('team') == params.teamId"

// GOOD — use `in` for containment.
access: "params.teamId in memberGroups('team')"

// BAD — referencing fields not in the context (silently denies; runtime
// errors are caught and turned into "deny").
access: "user.email == 'admin@example.com'"   // user.email is not in context

// BAD — assuming database.metadata.teamId exists when it doesn't.
// Missing fields evaluate to null; `isMemberOf('team', null)` returns false.
// Either guarantee metadata is set at create time, or guard:
access: "has(database.metadata.teamId) && isMemberOf('team', database.metadata.teamId)"
```

## Rule Sets for Group Management

Rule sets control who can manage groups (`category: "group"`) and group members (`category: "member"`). Each `(category, operation)` pair holds a CEL expression evaluated against the requesting user and the target group.

**Valid operations** for both categories: `create`, `edit`, `delete`, `list`. There is no `read` or `update` — use `edit`. There is no `add` — use `create` (for member.create = "add member").

**Important: a group type with NO rule set defaults to admin/owner-only.** For non-admins, `groups.list()` skips groups whose type has no `ruleSetId`, and all mutations are denied. To make a group type usable by regular members, attach a rule set.

### Defining a rule set

Rule sets are defined in TOML config files:

**File:** `config/rule-sets/team-rules.toml`

```toml
[ruleSet]
name = "team-rules"
resourceType = "group"
description = "Controls who can manage team groups and members"

[rules.group]
create = "true"                                               # any signed-in member can create a team
edit   = "isMemberOf(group.groupType, group.groupId)"         # only members can rename
delete = "user.userId == group.createdBy"                     # only the creator can delete
list   = "isMemberOf(group.groupType, group.groupId)"         # only members see the team in list

[rules.member]
create = "isMemberOf(group.groupType, group.groupId)"         # any member can invite
delete = "user.userId == target.userId || user.userId == group.createdBy"  # self-leave or creator-kick
list   = "isMemberOf(group.groupType, group.groupId)"
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

| Variable | Always present? | Description |
|----------|-----------------|-------------|
| `user.userId` | yes | Requesting user's ID |
| `user.role` | yes | Requesting user's app role (`"owner"` / `"admin"` / `"member"`). NOT `user.appRole`. |
| `group.groupType` | yes | Target group's type |
| `group.groupId` | yes | Target group's ID (also present at `create` time — server passes the requested ID) |
| `group.name` | yes | Target group's display name |
| `group.createdBy` | yes (after create) | userId of the group creator |
| `target.userId` | only `category: "member"`, ops `create`/`edit`/`delete` | Target user being added/removed. Absent for `member.list`. |

`group.description` is **NOT** in the rule context. Don't reference it.

Plus all CEL functions: `isMemberOf`, `memberGroups`, `hasRole`, `now()`, `fromWorkflow()`.

**Owners and admins always bypass rule evaluation.** Don't try to restrict them via rules.

**Don't do this — rule CEL footguns:**

```toml
# BAD — `user.appRole` does not exist. Use user.role.
create = "user.appRole == 'admin'"

# BAD — admins bypass anyway, so this is dead code in practice.
create = "hasRole('admin')"

# BAD — referencing target on member.list (target is undefined there).
list = "target.userId != user.userId"

# BAD — referencing group.description (not in the context).
edit = "group.description != ''"

# BAD — typo: operations are `create/edit/delete/list`, not `update/read`.
[rules.group]
update = "true"
read   = "true"

# GOOD — same intent with valid operations.
[rules.group]
edit = "true"
list = "true"
```

### Testing rules

Test a rule set with a simulated request (returns `{ allowed, expression?, context?, trace?, error? }`):

```typescript
const result = await client.ruleSets.test(ruleSetId, {
  category: "group",                    // "group" or "member" for resourceType: "group"
  operation: "create",                  // "create" | "edit" | "delete" | "list"
  user: { userId: "user-123", role: "member" },
  memberships: [{ groupType: "team", groupId: "engineering" }],  // optional
  group: {                                                       // required for non-create when group context is needed
    groupType: "team",
    groupId: "engineering",
    name: "Eng",
    createdBy: "user-456",
  },
  target: { userId: "user-456" },       // for member.create/edit/delete
});
// result.trace shows every isMemberOf/memberGroups/hasRole call and its result.
```

Debug evaluation against a real user (uses live memberships, returns full trace). **Requires console-admin auth** — regular app callers will get 403 from this endpoint:

```typescript
const debug = await client.ruleSets.debug({
  userId: "user-123",
  groupType: "team",
  groupId: "engineering",       // optional — omit for create
  category: "member",
  operation: "create",
  targetUserId: "user-456",     // optional
});
// debug: { allowed, expression?, reason?, ruleSetId?, ruleSetName?,
//          user?, memberships?, context?, trace? }
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

- **App owners and admins bypass all group/collection rule-set evaluation.** Design rules for regular members — don't try to restrict owners/admins there.
- **Database operation `access` CEL is NOT bypassed for admins.** If admins should be able to call an operation, include them explicitly: `hasRole('admin') || hasRole('owner') || isMemberOf(...)`.
- **Use per-parameter access** for sensitive relationships (parent-child, manager-report).
- **Keep rule sets simple.** Complex nested CEL expressions are hard to debug. Prefer multiple focused operations over one operation with complex access logic.
- **Test rules** with `client.ruleSets.test()` before deploying, and use `client.ruleSets.debug()` to trace evaluation for real users.

## Common Errors

| Symptom | Cause | Fix |
|---------|-------|-----|
| `addMember` returns `status: "pending_signup"` | Email isn't an app user yet | Expected. Membership resolves when they sign up or accept via `inviteToken`. Render a pending-members UI; cancel via `removeMember({ email })` or `invitations.revokeDeferredGrant(deferredId, "group")`. |
| `addMember` returns `status: "already_member"` | User already in the group | Idempotent — no error. Replaces the previous HTTP 409 response. |
| 409 on `groups.create` | A group with that `(groupType, groupId)` already exists | Use a different `groupId` or call `groups.get` first. |
| 403 on `groups.create` (member role) | Group type has no `ruleSetName`, or the `group.create` rule denied it | Attach a rule set with a permissive `group.create` expression, or call as an owner/admin. |
| 403 on `groups.create` with `groupType` starting with `_` | Reserved system group type | Pick a different prefix. |
| Group permission not taking effect on document | User hasn't reopened the document | Close and reopen the document to pick up new group permissions. |
| CEL `isMemberOf` returns false unexpectedly | Wrong `groupType`/`groupId` casing, user not yet added (deferred), or membership cache stale | Verify with `listUserMemberships(userId)`; remember email-based adds defer until sign-up. |
| Rule evaluation always denies, no obvious reason | Expression references a field not in the context (e.g. `user.appRole`, `group.description`) — runtime errors are silently turned into deny | Run `client.ruleSets.debug({...})` and inspect `trace`/`expression`/`context`. |
| Can't restrict admin/owner access via rules | By design — they bypass `evaluateRule` | Use group memberships for fine-grained access; don't try to gate admins. |
