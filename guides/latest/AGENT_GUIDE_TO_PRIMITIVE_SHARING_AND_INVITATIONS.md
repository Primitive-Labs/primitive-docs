# Agent Guide to Primitive Sharing and Invitations

Guidelines for AI agents implementing invitations, document sharing, group membership, access requests, and bookmarks.

## Mental Model

Sharing in Primitive is built from three orthogonal primitives the client cares about, plus several internal primitives the platform manages on your behalf.

**Client-facing primitives:**

| Primitive | Grants | Scope |
|-----------|--------|-------|
| `AppInvitation` | Right to join the app | App |
| `DocumentPermission` | Access to a single document | Document |
| `DocumentGroupPermission` | Access via group membership | Document |
| `DatabaseGroupPermission` | Access to a database via group | Database |
| `DocumentAccessRequest` | Request owner attention | Document |
| `Bookmark` | Presentational pointer only (no access) | User |

**Internal (platform-managed):**

| Primitive | Purpose |
|-----------|---------|
| `DeferredDocumentPermission` | Tracks an email-based share until the recipient signs up |
| `DeferredGroupAdd` | Tracks an email-based group add until the recipient signs up |

The deferred types exist to make email-based sharing work (the platform has to remember the intent until a matching user account exists). **Agents should not normally interact with them directly** — the sharing APIs accept emails transparently, and the platform handles resolution. The `client.deferredGrants.*` surface exists only for admin debugging tools.

**Decision rules:**

1. If you have a `userId` → write the direct permission/membership record.
2. If you only have an email → write the same record by email; the platform handles everything else.
3. If the user has a link but no access → show a "Request access" UI; don't silently grant.
4. Use groups for team-scoped access; use direct permissions for individual access.
5. Bookmarks are UI state, not access. Never use bookmarks to gate access.

---

## Critical Rules

1. **Always accept email in user-facing flows.** Users know each other's emails, not userIds. The server handles the userId resolution or creates a deferred grant.

2. **Never assume membership is immediate.** Deferred grants resolve at signup, not at invitation time. Don't build a UI that shows "Alice is in this group" until the signup has happened.

3. **Never grant access just because a bookmark exists.** Bookmarks are presentational. Access comes from `DocumentPermission`, `DocumentGroupPermission`, `DatabaseGroupPermission`, or a resolved deferred grant.

4. **Check member-invitation quota before showing invite UI.** If the member can't create an invitation, showing the button is worse than hiding it.

5. **Handle the `canRequestAccess` hint on 403s from `documents.get`.** It's the signal to switch from a generic error screen to a "Request access" flow.

6. **Never delete `AppInvitation` records directly.** Use `client.invitations.revoke(id)` — it cascades so no pending share or group add is left behind.

---

## Invitations

### Admin Flow

```typescript
// Admin invites a user to the app
await client.invitations.create({
  email: "alice@example.com",
  role: "member", // or "admin"
});
```

### Member-Invite Flow (with Quotas)

Enabled per-app via `memberInvitationsEnabled: true` and capped by `memberInvitationLimit`.

```typescript
// Check quota first
const quota = await client.invitations.getQuota();
// { used, limit, remaining, unlimited }

if (!quota.unlimited && quota.remaining <= 0) {
  return showQuotaExhausted();
}

// Members can only invite with role: "member"
await client.invitations.create({
  email: "teammate@example.com",
  role: "member",
});
```

Error codes:
- `INVITATION_QUOTA_EXCEEDED` — member has hit their cap
- `INVITATION_ROLE_FORBIDDEN` — member tried to invite an admin
- `MEMBER_INVITATIONS_DISABLED` — `memberInvitationsEnabled` is `false`

### Listing and Revoking

```typescript
const { items } = await client.invitations.list();
await client.invitations.revoke(invitationId);
```

Revoking an `AppInvitation` rescinds the right to join the app and cascades to every pending email-based share or group add linked to that invitation. If the invitee hasn't signed up yet, this is the single API call that fully undoes the invitation + any pending shares.

### Custom Email CTAs — `getAcceptToken` and `accept`

When your app sends its own invitation email (e.g. branded HTML via a workflow step), you need to embed a working accept link. The `inviteToken` is returned directly from `invitations.create()`:

```typescript
const invitation = await client.invitations.create({
  email: "alice@example.com",
  role: "member",
  sendEmail: false, // suppress the platform's default email
});

const acceptUrl = `https://app.example.com/invite/accept?inviteToken=${invitation.inviteToken}`;
// Embed acceptUrl in your own branded email
```

To retrieve the token for an existing invitation (e.g. for a "resend" flow):

```typescript
const info = await client.invitations.getAcceptToken(invitationId);
// { invitationId, inviteToken, email, expiresAt, status }
```

When the user lands on your accept page and is authenticated, consume the token:

```typescript
const result = await client.invitations.accept(inviteToken);
// { status: "accepted", invitationId, grantsResolved: { groups, documents } }
```

`accept` marks the invitation accepted (write-once) and resolves all pending deferred grants linked to it — even if the user's current account email differs from the invited email. Throws `INVITE_TOKEN_INVALID`, `INVITE_TOKEN_EXPIRED`, or `INVITE_ALREADY_ACCEPTED` on failure.

---

## Document Sharing

### Grant Forms

Three shapes for `setPermissions` entries:

```typescript
// By userId
{ userId: "user-abc", permission: "read-write" }

// By email (resolves to user or creates deferred grant)
{ email: "alice@example.com", permission: "read-write" }

// Remove a grant
{ userId: "user-abc", permission: null }
```

Batch:

```typescript
await client.documents.setPermissions(documentId, [
  { userId: "user-abc", permission: "read-write" },
  { email: "alice@example.com", permission: "reader" },
  { email: "bob@example.com", permission: "read-write" },
]);
```

Response includes a per-entry status so the caller can show which entries became deferred vs. immediate:

```typescript
// {
//   results: [
//     { userId: "user-abc", status: "granted" },
//     { email: "alice@example.com", userId: "user-resolved", status: "granted" },
//     { email: "bob@example.com", status: "deferred", invitationId: "inv-123" },
//   ]
// }
```

### Group Sharing

```typescript
await client.documents.setGroupPermission(documentId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write",
});
```

Member changes in the group propagate automatically — no per-membership permission calls needed.

### Looking Up Users

```typescript
// Returns user record or null. Use this before offering share-by-userId UI.
const user = await client.users.lookup({ email: "alice@example.com" });
```

---

## Group Membership

```typescript
// By userId — immediate
await client.groups.addMember("team", "engineering", { userId: "user-abc" });

// By email — resolves or defers
await client.groups.addMember("team", "engineering", {
  email: "alice@example.com",
});
```

The return shape distinguishes the two paths:

```typescript
// { status: "added", userId: "user-abc" }
// { status: "deferred", invitationId: "inv-123" }
```

Use `status` to drive UI — a "deferred" result should show "Will be added when Alice joins" rather than a completed checkmark.

---

## Deferred Grants

Deferred grants are the bridge between "I know this person's email" and "they're in the app."

### Lifecycle

1. Agent writes a grant by email for `alice@outside.com`.
2. Server creates an `AppInvitation` (or reuses existing) and a `DeferredDocumentPermission` / `DeferredGroupAdd`.
3. Alice receives an invitation email.
4. Alice signs up (any auth method).
5. On first provision, server resolves all pending deferred grants for her email in one transaction, then fires `invitation`/`accepted` WS events.

### Domain-Mode Apps

Deferred grants are re-validated at resolution time. In a domain-restricted app, a grant for an email outside the allowed domains is silently dropped at resolution, and the invitation is rejected. Do not rely on deferred grants to be a side channel around domain policy.

### Inspecting Pending State (Debugging Only)

For admin/debug tooling that needs to inspect what's queued for a specific email:

```typescript
const { grants } = await client.deferredGrants.list({
  email: "alice@example.com",
});
```

Reserve this for admin-debug UIs. Don't use it in end-user product flows — see "Deferred Grants: Internal Detail" below.

---

## Document Access Requests

Implement a request-access UI when `documents.get` returns `DOC_ACCESS_DENIED` with `canRequestAccess: true`.

### Requester Flow

```typescript
try {
  const doc = await client.documents.get(documentId);
} catch (err) {
  if (err.code === "DOC_ACCESS_DENIED" && err.details?.canRequestAccess) {
    await client.documents.requestAccess(documentId, {
      message: "Working on the Q2 planning deck",
    });
    showPendingUI();
  } else {
    showHardDeniedUI();
  }
}
```

### Listener for Resolution

```typescript
client.on("document:access-request-resolved", (event) => {
  if (event.requestId === pendingRequestId) {
    if (event.status === "approved") refreshDocument(event.documentId);
    else showDenied(event.reason);
  }
});
```

### Owner/Admin Flow

```typescript
const { requests } = await client.documents.listAccessRequests(documentId);

// Approve with a specific permission level
await client.documents.approveAccessRequest(documentId, requestId, {
  permission: "read-write",
});

// Deny with an optional reason
await client.documents.denyAccessRequest(documentId, requestId, {
  reason: "Please contact sales",
});
```

### Constraints

- 30-day TTL on unresolved requests.
- One pending request per (document, requester) pair.
- Resolved requests are immutable — no re-resolve.

---

## Bookmarks

### API

```typescript
await client.me.bookmarks.add({
  userDefinedKey: "projects/acme/q2-planning", // you choose
  targetObjType: "document",                    // or "database", "workflow", ...
  targetObjId: documentId,
});

const { items } = await client.me.bookmarks.list({
  prefix: "projects/acme/", // optional hierarchical filter
});

await client.me.bookmarks.rename(oldKey, newKey);
await client.me.bookmarks.remove(key);
```

### Design Guidelines

1. **Use hierarchical `userDefinedKey`s.** `projects/acme/q2-planning` is better than `q2-planning` because prefix queries let you organize folders cheaply.

2. **Prefer `client.me.sharedDocuments()` for "shared with me" UI.** It resolves access via all paths (direct, group, resolved deferred). Filtering bookmarks for this is both wrong (misses shared-but-unbookmarked items) and expensive.

3. **Auto-bookmarks happen on document creation and invitation acceptance.** Do not create duplicate bookmarks in client code — the server handles these cases.

4. **Bookmarks are purely presentational.** Never make access decisions based on bookmark existence.

---

## WebSocket Events

Subscribe to keep sharing UI live without polling.

```typescript
// Fires when someone you invited accepts
client.on("invitation", (event) => {
  if (event.type === "accepted") {
    refreshMembersList();
  }
});

// Fires for document owners and admins
client.on("document:access-request-created", (event) => {
  // event.documentId, event.requesterId, event.message
  addPendingBadge(event.documentId);
});

// Fires for the original requester
client.on("document:access-request-resolved", (event) => {
  // event.status: "approved" | "denied"
  // event.documentId, event.requestId
});
```

---

## Building a "Members + Pending" UI

Sharing UIs typically show two sections: people who currently have access and people who've been invited but haven't signed up yet.

### Current Members

Document:

```typescript
const members = await client.documents.listPermissions(documentId);
// [{ userId, email, name, avatarUrl, permission, grantedAt }, ...]
```

Group:

```typescript
const members = await client.groups.listMembers(groupType, groupId);
// [{ userId, userName, userEmail, addedAt, addedBy }, ...]
```

### Pending Invitations (App-Level)

```typescript
const { items: invitations } = await client.invitations.list();
const pending = invitations.filter(i => !i.accepted);
// [{ invitationId, email, role, invitedAt, expiresAt, source, ... }, ...]
```

### Pending Invitations (Per-Group)

Use `listPendingInvitations` to get unresolved, non-expired invitations scoped to a specific group:

```typescript
const pending = await client.groups.listPendingInvitations(groupType, groupId);
// [{ email, role, invitationId, createdAt, expiresAt, addedBy }, ...]
```

This is the right call to build a per-group "Members + Pending" panel without approximating from the app-level list.

### Canceling a Pending Invitation

To rescind a pending invitation — including any email-based shares or group adds attached to it — revoke the `AppInvitation`. This is a single call that cascades.

```typescript
await client.invitations.revoke(invitationId);
```

### Removing Someone Who Already Has Access

Document:

```typescript
await client.documents.setPermissions(documentId, [
  { userId, permission: null },
]);
```

Group:

```typescript
await client.groups.removeMember(groupType, groupId, userId);
// or by email — removes member AND cancels any pending deferred invitation:
await client.groups.removeMember(groupType, groupId, { email });
```

When removing by email, the server handles both the "already a member" case and the "pending invite" case in one call. To cancel a pending invitation and all of its linked grants across resources, revoke the `AppInvitation` directly.

## Deferred Grants: Internal Detail

`DeferredDocumentPermission` and `DeferredGroupAdd` are platform-managed state. The sharing APIs transparently create them when you share by email to a non-member, and the signup flow resolves them automatically. You should not need to read or mutate them in normal product code.

The `client.deferredGrants.list(...)` surface exists for admin debugging — e.g. a support tool that investigates "why did/didn't this user get access." Use it there, not in end-user flows.

---

## Common Patterns

### "Invite + share + add to group" in one flow

```typescript
async function onboardTeammate(email: string, projectDocId: string) {
  const quota = await client.invitations.getQuota();
  if (!quota.unlimited && quota.remaining <= 0) {
    throw new Error("Invitation quota exhausted");
  }

  await client.invitations.create({ email, role: "member" });

  await client.documents.setPermissions(projectDocId, [
    { email, permission: "read-write" },
  ]);

  await client.groups.addMember("team", "engineering", { email });
}
```

After signup, every grant resolves in a single server-side transaction.

### "Share with a group for access + grant-by-email for external reviewers"

```typescript
// Team-wide access
await client.documents.setGroupPermission(docId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write",
});

// External reviewer, read-only
await client.documents.setPermissions(docId, [
  { email: "reviewer@external.com", permission: "reader" },
]);
```

### "Request access" UI as a fallback for hard 403s

Always branch on `canRequestAccess`. If the document is in a mode that doesn't accept requests, the hint is `false` and you should show a plain denial.

```typescript
const hint = err.details?.canRequestAccess;
if (hint) showRequestAccessButton();
else showDeniedMessage();
```

---

## Anti-Patterns

- ❌ Creating your own `shares` or `invitations` database. Use the platform primitives.
- ❌ Using `addMember` with a userId you fetched from the client (race-prone). Let the server resolve the email.
- ❌ Filtering bookmarks to build a "shared with me" view. Use `client.me.sharedDocuments()`.
- ❌ Making access decisions based on bookmark membership.
- ❌ Showing a "request access" button without checking `canRequestAccess`.
- ❌ Polling `invitations.list()` for acceptance. Subscribe to the `invitation`/`accepted` WS event instead.
- ❌ Deleting `AppInvitation` rows directly. Use `revoke` so pending shares and group adds cascade.

---

## Error Codes

| Code | When it fires |
|------|---------------|
| `DOC_ACCESS_DENIED` | `documents.get` returns 403; check `details.canRequestAccess` |
| `INVITATION_QUOTA_EXCEEDED` | Member over their cap |
| `INVITATION_ROLE_FORBIDDEN` | Member tried to invite an admin |
| `MEMBER_INVITATIONS_DISABLED` | Member tried to invite with `memberInvitationsEnabled: false` |
| `ACCESS_REQUEST_ALREADY_PENDING` | Requester already has a pending request for this doc |
| `ACCESS_REQUEST_RESOLVED` | Attempting to re-resolve a request |
| `DOMAIN_NOT_ALLOWED` | Email is outside domain-mode allowed domains |
| `INVITE_TOKEN_INVALID` | `invitations.accept` called with an unrecognized token |
| `INVITE_TOKEN_EXPIRED` | `invitations.accept` called after the invitation's `expiresAt` |
| `INVITE_ALREADY_ACCEPTED` | `invitations.accept` called on an already-accepted invitation |

---

## Related Guides

- [Documents](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md) — Document permissions, the base layer for sharing
- [Users and Groups](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md) — Groups and CEL
- [Authentication](AGENT_GUIDE_TO_PRIMITIVE_AUTHENTICATION.md) — How signup triggers deferred-grant resolution
