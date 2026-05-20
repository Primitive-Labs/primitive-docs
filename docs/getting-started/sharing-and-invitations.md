# Sharing and Invitations

Primitive apps are multi-user. This page is about getting other people into your app and giving them access to your data — invitations, document sharing, group and collection membership, and access requests.

The building blocks work together. Most real apps end up using several of them:

| Mechanism | What it does |
|---|---|
| **App invitations** | Bring someone new into your app |
| **Member invitations** | Let non-admin members invite teammates (with quotas) |
| **Document sharing** | Grant document-level access to a user, email, or group |
| **Group membership** | Bulk access via team/role membership |
| **Collections** | Group documents and share them as a set; add members by user id or email |
| **Email-based sharing** | Share by email to someone who isn't a user yet — resolves when they sign up |
| **Document access requests** | "Request access" flow for users with a link |

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

The invitee receives an email. The invitation is consumed when they sign up with the invited email **or** when they accept it under a different account using the invitation's token (see [Accepting an Invitation with a Different Email](#accepting-an-invitation-with-a-different-email)).

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
const quota = await client.invitations.quota();
// { used: 2, limit: 5, remaining: 3, unlimited: false }

if (quota.unlimited || quota.remaining > 0) {
  showInviteButton();
}
```

Attempting to invite over the quota returns a `403 INVITATION_QUOTA_EXCEEDED` error.

::: tip Only `role: "member"` is allowed from members
Members cannot invite other admins, even when member invitations are enabled. If a member passes `role: "admin"`, the server rejects the request.
:::

### Listing and Canceling Invitations

```typescript
const { items } = await client.invitations.list();

await client.invitations.delete(invitationId);
```

`delete` cascades — any pending email-based document shares or group adds attached to the invitation are removed in the same operation. There is no separate `revoke()` method.

### Sending Your Own Invitation Emails

By default the platform sends invitation emails. If you'd rather send branded emails from your own ESP, every invitation exposes a tokenized `inviteToken` that you can drop into a CTA URL:

```typescript
const invitation = await client.invitations.create({
  email: "alice@example.com",
  role: "member",
  sendEmail: false, // suppress the platform email
});

const acceptUrl = `https://myapp.example/invite/accept?inviteToken=${invitation.inviteToken}`;
await myEmailService.send({ to: invitation.email, link: acceptUrl });
```

The same `inviteToken` is also surfaced inline on the deferred entries returned by `client.documents.updatePermissions({ email })` and `client.groups.addMember({ email })`, so the same custom-email pattern works for share-by-email and add-to-group flows. To look up the token for an existing invitation later — e.g. on a "resend invite" button — use:

```typescript
const token = await client.invitations.getAcceptToken(invitationId);
// { invitationId, inviteToken, email, expiresAt, accepted, acceptedAt, status }
```

For details on what happens when the recipient clicks the link — auto-resolution on email match, explicit accept under a different identity, and the landing-page wiring your app needs (or what the template ships out of the box) — see [How Email-Based Sharing Resolves](#how-email-based-sharing-resolves) below.


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
await client.documents.updatePermissions(documentId, {
  userId: "user-abc",
  permission: "read-write",
});
```

### Share by Email

The most common case — you have a colleague's email but don't know (or care) whether they've signed up yet:

```typescript
await client.documents.updatePermissions(documentId, {
  email: "alice@example.com",
  permission: "read-write",
});
```

Two paths:

1. **Existing user** — the server resolves the email to a userId and grants access immediately.
2. **Non-member** — the server creates an invitation (if one doesn't exist) and remembers the pending share. The recipient receives a share email when `sendEmail: true` is passed (existing members get the `document-share` template; non-members get the `document-share-deferred` template, which carries a tokenized accept URL composed from `app.baseUrl`). When they sign up with that email, the share is applied automatically. Repeated calls for the same recipient are idempotent — the latest `permission` value wins and only one pending entry is tracked.

Batch shares can mix both forms:

```typescript
await client.documents.updatePermissions(documentId, {
  permissions: [
    { userId: "user-abc", permission: "read-write" },
    { email: "alice@example.com", permission: "reader" },
    { email: "bob@example.com", permission: "read-write" },
  ],
});
```

When you set `sendEmail: true`, you also need `documentUrl` in the request and `app.baseUrl` configured on the app — the server uses both to compose the share/accept links.

### Share with a Group

Grant document access to everyone in a group. When group membership changes, access updates automatically:

```typescript
await client.documents.grantGroupPermission(documentId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write",
});
```

### Checking Who a Document Is Shared With

```typescript
const result = await client.users.lookup("alice@example.com");
// { exists: true, user: { userId, name, email } } | { exists: false }
```

See [Working with Documents](./working-with-documents.md) for document fundamentals.

## Group Membership by Email

Groups support the same email-based pattern for invitations:

```typescript
const result = await client.groups.addMember("team", "engineering", {
  email: "alice@example.com",
});
```

The result is a discriminated union — branch on `result.status` to drive your UI:

| `status` | Meaning |
|---|---|
| `"added"` | Email matched an existing user; new membership row was just created |
| `"already_member"` | Email matched an existing user who was already in the group (idempotent — no error) |
| `"pending_signup"` | Email is not yet an app user; a deferred add was created and will resolve at signup or token-acceptance |

The `"pending_signup"` branch carries `invitationId` and `inviteToken` so you can plug them into a custom invitation email if you're not using the platform's default email path.

See [Users and Groups](./users-and-groups.md) for more on groups.

## Collection Membership

A collection bundles documents together so they can be shared as a unit. Adding a member to a collection grants them access to every document currently in it and to any document later added to it. Like groups, you can add by user id or by email:

```typescript
// Existing user
await client.collections.addMember(collectionId, {
  userId: "u-1234",
  permission: "read-write",   // "reader" | "read-write"
});

// By email — deferred grant resolves on signup
const result = await client.collections.addMember(collectionId, {
  email: "newhire@example.com",
  permission: "reader",
  sendEmail: true,                    // optional: platform sends an invite email
  collectionUrl: "https://...",       // required when sendEmail is true
  note: "Sharing the onboarding docs",
});
// result.status: "added" | "already_member" | "pending_signup"
```

The deferred-grant flow mirrors document shares (see [How Email-Based Sharing Resolves](#how-email-based-sharing-resolves)) — the platform records a `DeferredGroupAdd`, sends an invitation email when `sendEmail: true`, and applies the membership when the recipient signs up with the matching email.

To see who's currently a member and who has a pending invitation:

```typescript
const access = await client.collections.getAccess(collectionId);
// { directMembers, groupPermissions, ... }

const pending = await client.collections.listPendingInvitations(collectionId);
// [{ email, permission, invitationId, ... }]
```

## How Email-Based Sharing Resolves

When you share by email to someone who isn't a user yet, Primitive internally records the pending grant and resolves it as soon as the right person redeems the invitation. The sharing APIs accept emails transparently — the platform handles the rest.

There are two resolution paths. **Apps don't pick which one runs — the recipient does**, by what they click and which email they sign in with.

### Path A — Sign up with the invited email (automatic)

The common case. The user clicks the invite link and signs up using the same email the invitation was sent to:

1. You share a document with `newhire@example.com` at `read-write`. The platform creates an `AppInvitation` + `DeferredDocumentPermission` and sends them an email.
2. They click the link, land on your app, and sign up using `newhire@example.com` (magic link, OTP, Google, passkey — any method).
3. The signup flow detects the email match and resolves **every** pending deferred grant linked to that invitation in one transaction — `AppMembership`, `DocumentPermission`, `DocumentGroupPermission`, collection memberships, etc. No `accept` call is needed.

This is what runs whenever the recipient's signup email matches the invited email. Your app does not need to call `client.invitations.accept(...)` for this case.

### Path B — Accept under a different identity (explicit)

The recipient is signed in (or wants to sign in) under a **different** email than the invitation was sent to — for example, invited at `work@example.com` but signing in with their personal `home@gmail.com` — or they're an **existing user** who wants to bind a fresh deferred grant to their current account. In both cases the platform can't infer intent from the email, so the app calls accept explicitly:

```typescript
const result = await client.invitations.accept(inviteToken);
// { status: "accepted", invitationId, grantsResolved: { groups, documents } }
```

The invitation is marked accepted (write-once) and every deferred grant linked to it is bound to the **currently signed-in user** — regardless of the email the invite was sent to. `AppInvitation.acceptedByUserId` records the user that actually accepted, which may differ from the invited email.

### What your app needs to wire up

The `inviteToken` is what carries the invitation across the wire — every share-by-email flow returns one (`client.invitations.create({ email })`, the deferred branch of `client.documents.updatePermissions({ email })`, and `client.groups.addMember({ email })` all expose `inviteToken` on the response). Your app decides where to send the recipient: the platform's default email templates use a conventional URL shape of `${app.baseUrl}/invite/accept?inviteToken=...`, but that's a convention the templates use — not a platform-enforced shape. If you send your own email (`sendEmail: false` plus your own ESP, or a custom email template), you can drop the token into any URL you like as long as the page on the other end knows how to read it.

Whatever URL you land them on, the page needs to handle three states:

1. **Signed-in invitee** — show "Accept with this account?", confirm, then call `client.invitations.accept(inviteToken)` and redirect into the app.
2. **Signed-out invitee** — stash the token in `sessionStorage`, redirect to the login flow, and pass the token through to whichever auth method the user picks (magic link, OTP, passkey, OAuth) so the server resolves grants in the same round-trip — no second click needed after signup.
3. **Errors** — `INVITE_TOKEN_INVALID`, `INVITE_TOKEN_EXPIRED`, `INVITE_ALREADY_ACCEPTED` each need their own UI. Don't show raw API errors.

The `primitive-app-template` ships a working implementation of all three — `src/pages/InviteAcceptPage.vue` (the landing page, mounted at `/invite/accept`) and `src/lib/inviteToken.ts` (the sessionStorage carry-over) wired into `userStore` so each auth method forwards the pending token automatically. **If you're using the template, this is already done — point your invitation emails at `${yourApp.baseUrl}/invite/accept?inviteToken=${token}` (the convention the template's router expects).** If you let the platform send the default email and your `app.baseUrl` is configured, this is also the URL shape the default templates use, so the two line up out of the box.

If you're hand-rolling the flow (custom email + custom landing page), the steps:

1. Pick a URL shape that suits your app. Anything that round-trips the `inviteToken` works — the platform doesn't enforce a specific path. The token can ride in a query string, a fragment, or as part of a short-link redirect — your call.
2. Render that URL inside your custom email body (or inline magic-link page), substituting the `inviteToken` you got back from `client.invitations.create({ email, sendEmail: false })`, the deferred branch of `client.documents.updatePermissions({ email })`, or `client.groups.addMember({ email })`.
3. Build a route in your app that reads the token from wherever you put it.
4. On mount, branch on signed-in status:
   - **Signed in:** confirm with the user (so they don't bind grants to the wrong account), then `await client.invitations.accept(inviteToken)`.
   - **Signed out:** save the token in `sessionStorage` (`primitive:pendingInviteToken` is the convention used by the template) and redirect to your login page.
5. In your auth flow, after the user picks a method (magic link / OTP / passkey / OAuth), read the pending token from `sessionStorage` and pass it as the `inviteToken` argument to the corresponding verify/finish call (`magicLinkVerify`, `otpVerify`, `passkeyRegisterFinish`, `startOAuthFlow`). The server resolves grants atomically with signup.
6. Clear the token from `sessionStorage` on success or on a clear error path.
7. Validate token shape before accepting — the template uses a loose check (`isPlausibleInviteToken` in `src/lib/inviteToken.ts`) to avoid round-tripping obvious garbage.

The `primitive-app-template` and `primitive-app-demo` projects in [`Primitive-Labs/primitive-app-dev`](https://github.com/Primitive-Labs/primitive-app-dev) both implement this end-to-end — read `primitive-app-template/src/pages/InviteAcceptPage.vue` together with `primitive-app-template/src/lib/inviteToken.ts` and `primitive-app-template/src/stores/userStore.ts` to see all the wiring in one place.

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

## Listing the User's Documents

Two calls cover the "my documents" surface — what the user owns and what's been shared with them:

```typescript
// Documents the user owns (they created them, or ownership was transferred).
const owned = await client.me.ownedDocuments();
// Options: { includeRoot, tag, limit, cursor, forward, returnPage } — pass returnPage: true for a paginated DocumentListPage.

// Documents shared directly with the user.
const { documents } = await client.me.sharedDocuments();
// Options: { tag, limit, cursor }. Includes non-owner DocumentPermissions and
// pending DocumentInvitations. Does NOT include group- or collection-shared docs —
// those are listed through the group (groups.listDocuments) or the collection
// (collections.listDocuments).
```

For pending document invitations specifically, use `client.me.pendingDocumentInvitations()`.

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
const members = await client.documents.getPermissions(documentId);
// [{ userId, email, name, avatarUrl, permission, grantedAt }, ...]
```

For a group:

```typescript
const members = await client.groups.listMembers(groupType, groupId);
// [{ userId, userName, userEmail, addedAt, addedBy }, ...]
```

### Pending Invitations

App-wide:

```typescript
const { items: invitations } = await client.invitations.list();
const pending = invitations.filter(i => !i.accepted);
// [{ invitationId, email, role, invitedAt, expiresAt, source, inviteToken, ... }]
```

Per-resource — for "this specific document" or "this specific group" panels:

```typescript
const docPending = await client.documents.listPendingInvitations(documentId);
// [{ email, permission, invitationId, createdAt, expiresAt, grantedBy? }]

const groupPending = await client.groups.listPendingInvitations(groupType, groupId);
// [{ email, role, invitationId, createdAt, expiresAt, addedBy? }]
```

### Canceling a Pending Invitation

To withdraw a pending invitation — and any pending document shares or group adds attached to it — delete the invitation itself:

```typescript
await client.invitations.delete(invitationId);
```

### Removing Someone

The removal APIs handle both "currently has access" and "was invited but hasn't signed up yet" through a single call.

Document:

```typescript
// Existing user — by userId
await client.documents.removePermission(documentId, userId);

// By email — removes a current member if one matches, OR cancels the
// pending deferred share for that email if no direct grant exists.
await client.documents.removePermission(documentId, { email: "alice@example.com" });
```

Group:

```typescript
// Existing member — by userId
await client.groups.removeMember(groupType, groupId, userId);

// By email — removes the membership if one exists, OR cancels the
// pending DeferredGroupAdd for that email if no direct membership does.
await client.groups.removeMember(groupType, groupId, { email });
```

Use the email form whenever you don't want to think about whether the target has signed up yet — it does the right thing in either case. Revoking the whole `AppInvitation` is only needed when you want to cancel **every** grant attached to that invitation (the document share *and* the group add *and* the right to join the app).

## A Worked Example

A typical "invite a teammate and share a project with them" flow:

```typescript
// 1. Member (quota-checked) invites a teammate
const quota = await client.invitations.quota();
if (!quota.unlimited && quota.remaining <= 0) return showUpgradePrompt();

await client.invitations.create({
  email: "newhire@example.com",
  role: "member",
});

// 2. Share the project document with them (pending until signup)
await client.documents.updatePermissions(projectDocId, {
  email: "newhire@example.com",
  permission: "read-write",
});

// 3. Also add them to the engineering group (pending until signup)
await client.groups.addMember("team", "engineering", {
  email: "newhire@example.com",
});

// When the new user signs up, all three pending actions apply atomically.
// They land in the app with full team-group access and the project visible
// in their `me.sharedDocuments()` list.
```

## Next Steps

- **[Working with Documents](./working-with-documents.md)** — Document fundamentals and CRUD
- **[Users and Groups](./users-and-groups.md)** — Group concepts and CEL access patterns
- **[Authentication](./authentication.md)** — How users sign in and pending shares resolve
