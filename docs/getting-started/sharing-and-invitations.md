# Sharing and Invitations

Primitive apps are multi-user. This page is about getting other people into your app and giving them access to your data — invitations, document sharing, group membership, access requests, and bookmarks.

The building blocks work together. Most real apps end up using several of them:

| Mechanism | What it does |
|---|---|
| **App invitations** | Bring someone new into your app |
| **Member invitations** | Let non-admin members invite teammates (with quotas) |
| **Document sharing** | Grant document-level access to a user, email, or group |
| **Group membership** | Bulk access via team/role membership |
| **Email-based sharing** | Share by email to someone who isn't a user yet — resolves when they sign up |
| **Document access requests** | "Request access" flow for users with a link |
| **Bookmarks** | User-curated list of documents, databases, or any target |

## App Invitations

App invitations are how new users get into your app.

### Admin Invitations

Admins and app owners can always invite new users — no configuration needed:

```bash
primitive users invite alice@example.com
```

Or from your app:

```typescript
await client.invitations.create({
  email: "alice@example.com",
  role: "member",
});
```

The invitee receives an email. When they sign up with that email, the invitation is consumed and they join the app.

### Member Invitations (with Quotas)

By default only admins can invite. If you want regular members to invite teammates, enable member invitations:

```bash
primitive apps update --member-invitations-enabled --member-invitation-limit 5
```

or in the admin console under App Settings.

Two fields control the behavior:

| Field | Meaning |
|---|---|
| `memberInvitationsEnabled` | If `true`, users with role `"member"` can create invitations |
| `memberInvitationLimit` | Max active (non-accepted, non-expired) invitations per member |

Admins and owners are always exempt from the quota.

Members check their quota before showing an invite UI:

```typescript
const quota = await client.invitations.getQuota();
// { used: 2, limit: 5, remaining: 3, unlimited: false }

if (quota.remaining > 0) {
  showInviteButton();
}
```

Attempting to invite over the quota returns a `403 INVITATION_QUOTA_EXCEEDED` error.

::: tip Only `role: "member"` is allowed from members
Members cannot invite other admins, even when member invitations are enabled. If a member passes `role: "admin"`, the server rejects the request.
:::

### Listing and Revoking Invitations

```typescript
const { items } = await client.invitations.list();

await client.invitations.revoke(invitationId);
```

Revoking cascades — any pending email-based document shares or group adds attached to the invitation are removed in the same operation.

### Custom Invitation Emails

If you send your own invitation emails instead of relying on the platform's default template, you need to embed a working accept link in your email. Use `getAcceptToken` to fetch the token for an existing invitation, then compose the URL yourself:

```typescript
const info = await client.invitations.getAcceptToken(invitationId);
// info: { invitationId, inviteToken, email, expiresAt, status }

const acceptUrl = `https://app.example.com/invite/accept?inviteToken=${info.inviteToken}`;
// Embed acceptUrl in your custom email
```

The `inviteToken` is also returned directly from `invitations.create()`, so you can skip the `getAcceptToken` call when building the URL immediately after creating the invitation.

When the recipient clicks the link, accept the invitation on their behalf once they're authenticated:

```typescript
await client.invitations.accept(inviteToken);
// Returns: { status: "accepted", invitationId, grantsResolved: { groups, documents } }
```

This resolves all pending deferred grants linked to the invitation (document shares, group adds) to the authenticated user — even if their signup email differs from the invited email.


## Document Sharing

Documents are private by default. You share them by granting a permission level to a user, an email, or a group.

### Permission Levels

| Permission | Can View | Can Edit | Can Share | Can Delete |
|---|---|---|---|---|
| `reader` | Yes | | | |
| `read-write` | Yes | Yes | | |
| `owner` | Yes | Yes | Yes | Yes |

### Share by User ID

```typescript
await client.documents.setPermissions(documentId, [
  { userId: "user-abc", permission: "read-write" },
]);
```

### Share by Email

The most common case — you have a colleague's email but don't know (or care) whether they've signed up yet:

```typescript
await client.documents.setPermissions(documentId, [
  { email: "alice@example.com", permission: "read-write" },
]);
```

Two paths:

1. **Existing user** — the server resolves the email to a userId and grants access immediately.
2. **Non-member** — the server creates an invitation (if one doesn't exist) and remembers the pending share. The recipient receives a share email. When they sign up with that email, the share is applied automatically.

Batch shares can mix both forms:

```typescript
await client.documents.setPermissions(documentId, [
  { userId: "user-abc", permission: "read-write" },
  { email: "alice@example.com", permission: "reader" },
  { email: "bob@example.com", permission: "read-write" },
]);
```

### Share with a Group

Grant document access to everyone in a group. When group membership changes, access updates automatically:

```typescript
await client.documents.setGroupPermission(documentId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write",
});
```

### Checking Who a Document Is Shared With

```typescript
const users = await client.users.lookup({ email: "alice@example.com" });
// Returns the user record if they're in the app, or null.
```

See [Working with Documents](./working-with-documents.md) for document fundamentals.

## Group Membership by Email

Groups support the same email-based pattern for invitations:

```typescript
// Existing user → added immediately
await client.groups.addMember("team", "engineering", {
  email: "alice@example.com",
});

// Non-member → creates an invitation and remembers the pending add,
// resolves when they sign up
await client.groups.addMember("team", "engineering", {
  email: "newhire@example.com",
});
```

See [Users and Groups](./users-and-groups.md) for more on groups.

## How Email-Based Sharing Resolves at Signup

When you share by email to someone who isn't a user yet, Primitive internally records the pending grant and resolves it automatically when that person signs up. You don't interact with this machinery directly — the sharing APIs accept emails transparently and the platform handles the rest.

### What the End User Sees

1. You share a document with `newhire@example.com` at `read-write`.
2. They receive an app-invitation email.
3. They sign up (magic link, OTP, Google, passkey — any method).
4. On first load, the document is already in their bookmarks and they have `read-write` access. No additional click-through.

### Domain-Mode Apps

If your app restricts signup to specific email domains, pending shares are re-validated at resolution time. A share to `alice@external.com` won't land if the app only accepts `@mycompany.com` — the invitation is rejected at signup rather than granting access silently.

### Cascade on Revoke

Revoking an invitation also removes every pending share or group add that was attached to it — there's no risk of an orphan share activating after you change your mind.

## Document Access Requests

When a user has a document link (or ID) but no permission, they can request access. This is the Google-Docs-style "Request access" flow.

### How It Works for the Requester

A `403` from `client.documents.get(documentId)` includes a `canRequestAccess` hint when the document is configured to accept access requests:

```typescript
try {
  await client.documents.get(documentId);
} catch (err) {
  if (err.code === "DOC_ACCESS_DENIED" && err.details?.canRequestAccess) {
    // Show a "Request access" button
  }
}
```

Submitting a request:

```typescript
await client.documents.requestAccess(documentId, {
  message: "Working on the Q2 planning deck",
});
```

The requester receives an `access-request-created` email confirmation. Document owners and app admins receive a WebSocket event (`document:access-request-created`) so their UI can show a badge immediately.

### How It Works for Owners/Admins

```typescript
// List pending requests for a document
const { requests } = await client.documents.listAccessRequests(documentId);

// Approve — grants the requested permission
await client.documents.approveAccessRequest(documentId, requestId, {
  permission: "read-write",
});

// Deny
await client.documents.denyAccessRequest(documentId, requestId, {
  reason: "Please email sales instead",
});
```

When resolved, the requester receives:

- A `document:access-request-resolved` WebSocket event (so the UI can update live if they're still in the app)
- An `access-request-resolved` email with the outcome

### Rate Limiting and TTL

- Access requests have a 30-day TTL and are indexed per document and per requester.
- A requester cannot re-submit while a previous request for the same document is still pending.
- Once a request is resolved (approved or denied), it can't be re-resolved.

## Bookmarks

Bookmarks are how users curate their own list of "things I care about" — documents they've been shared into, databases they work in, workflows they use, anything.

### What Bookmarks Are (and Aren't)

Bookmarks are **presentational**, not access control. A bookmark is just a pointer that says "this user wants this item on their home screen." The underlying document/database permissions are still what decides access.

The model is intentionally generic:

- Primary key: `userId`
- Sort key: `userDefinedKey` (arbitrary string you pick — supports prefix queries)
- Fields: `targetObjType` (e.g. `"document"`, `"database"`), `targetObjId`

### Client API

```typescript
// Add a bookmark
await client.me.bookmarks.add({
  userDefinedKey: "projects/acme/q2-planning",
  targetObjType: "document",
  targetObjId: documentId,
});

// List with prefix
const { items } = await client.me.bookmarks.list({
  prefix: "projects/acme/",
});

// Rename (change the user-defined key)
await client.me.bookmarks.rename("projects/acme/q2-planning", "archived/q2-planning");

// Remove
await client.me.bookmarks.remove("archived/q2-planning");
```

### Auto-Bookmarking

Two events auto-create bookmarks so users don't have to:

1. **Document creation** — when a user creates a document, it's bookmarked automatically.
2. **Invitation acceptance** — when a user accepts a legacy `DocumentInvitation`, a bookmark is added for them.

You can still remove these if the app doesn't want them visible.

### Shared Documents Helper

For a quick "documents shared with me" view, use the dedicated helper rather than filtering bookmarks yourself:

```typescript
const { documents } = await client.me.sharedDocuments();
```

This returns documents the current user has access to via any path (direct, group, or a share that resolved at signup), excluding documents they own.

## WebSocket Events

Sharing and invitations emit events so your UI can update without polling:

| Event | Fires when |
|---|---|
| `invitation`/`accepted` | A user accepts an invitation (including acceptance via a document GET) |
| `document:access-request-created` | A user requests access to a document you own or admin |
| `document:access-request-resolved` | A request you submitted was approved or denied |

Subscribe as you would any client event:

```typescript
client.on("invitation", (event) => {
  if (event.type === "accepted") {
    refreshMembersList();
  }
});

client.on("document:access-request-created", (event) => {
  showAccessRequestBadge(event.documentId);
});
```

## Building a "Members + Pending" Panel

Sharing UIs typically show two sections: people who currently have access, and people who've been invited but haven't signed up yet.

### Current Members

For a document:

```typescript
const members = await client.documents.listPermissions(documentId);
// [{ userId, email, name, avatarUrl, permission, grantedAt }, ...]
```

For a group:

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

::: tip Per-resource pending lists
You can now list pending invitations scoped to a specific group:

```typescript
const pending = await client.groups.listPendingInvitations(groupType, groupId);
// [{ email, role, invitationId, createdAt, expiresAt, addedBy }, ...]
```

This returns only unresolved, non-expired invitations for that group. For app-level pending lists, use `client.invitations.list()` as before.
:::

### Canceling a Pending Invitation

To withdraw a pending invitation — and any pending document shares or group adds attached to it — revoke the invitation itself:

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
// or by email if you don't have the userId
await client.groups.removeMember(groupType, groupId, { email });
```

When removing by email, the server also cancels any pending deferred invitation for that email if no direct membership exists — a single call handles both the "already a member" and "pending invite" cases. To cancel a pending invitation and all shares/group adds attached to it (not just for one group), revoke the `AppInvitation` directly.

## A Worked Example

A typical "invite a teammate and share a project with them" flow:

```typescript
// 1. Member (quota-checked) invites a teammate
const quota = await client.invitations.getQuota();
if (quota.remaining <= 0) return showUpgradePrompt();

await client.invitations.create({
  email: "newhire@example.com",
  role: "member",
});

// 2. Share the project document with them (pending until signup)
await client.documents.setPermissions(projectDocId, [
  { email: "newhire@example.com", permission: "read-write" },
]);

// 3. Also add them to the engineering group (pending until signup)
await client.groups.addMember("team", "engineering", {
  email: "newhire@example.com",
});

// When the new user signs up, all three pending actions apply atomically.
// They land in the app with the project bookmarked and full team-group access.
```

## Next Steps

- **[Working with Documents](./working-with-documents.md)** — Document fundamentals and CRUD
- **[Users and Groups](./users-and-groups.md)** — Group concepts and CEL access patterns
- **[Authentication](./authentication.md)** — How users sign in and pending shares resolve
