# Agent Guide to Primitive Sharing and Invitations

Guidelines for AI agents implementing invitations, document sharing, group membership, access requests, and bookmarks.

## Mental Model

Sharing in Primitive is built from three orthogonal primitives the client cares about, plus several internal primitives the platform manages on your behalf.

**Client-facing primitives:**

| Primitive | Grants | Scope |
|-----------|--------|-------|
| `AppInvitation` | Right to join the app | App |
| `DocumentPermission` | Direct access to one document | Document |
| `DocumentGroupPermission` | Access via group membership | Document |
| `DatabaseGroupPermission` | Access to a database via group (`"manager"` only) | Database |
| `DocumentAccessRequest` | Request the owner notice you | Document |
| `Bookmark` | Presentational pointer only (no access) | User |

**Internal (platform-managed):**

| Primitive | Purpose |
|-----------|---------|
| `DeferredDocumentPermission` | Tracks an email-based share until the recipient signs up |
| `DeferredGroupAdd` | Tracks an email-based group add until the recipient signs up |

The deferred types make email-based sharing work — the platform remembers the intent until a matching user account exists. **Do not interact with them directly in product code.** The sharing APIs accept emails transparently. `client.invitations.listDeferredGrants(...)` exists only for admin debugging tools.

**Permission levels (document):** `"owner"` > `"read-write"` > `"reader"`. (`"admin"` is an app-role projection, not a grantable document permission.) Effective permission = MAX(direct, group-derived). Granting a *lower* group permission to someone who already has a higher direct grant is a no-op for them.

**Decision rules:**

1. If you have a `userId` → write the direct permission/membership record.
2. If you only have an email → write the same record by email; the platform handles everything else. No manual "accept" call is needed — deferred grants resolve automatically when the recipient signs in with a matching email.
3. If a user hits a 403 → check the response's `canRequestAccess` hint and either show "Request access" or a hard-deny screen.
4. **Share at the highest level that fits — `collection` > `group` > `doc`.** Granting on a collection automatically propagates to every document inside it (current and future). Don't add per-document grants for things you've already shared at the collection level. Same logic for groups: add a user to a group once, every doc that group has access to follows.
5. Use groups for team-scoped access; use direct permissions for individual access.
6. Bookmarks are UI state, not access. Never use bookmarks to gate access — but **do** use `client.me.bookmarks.list` as the primary "my documents" surface (see [Discovery cheat sheet](#discovery-cheat-sheet)).

---

## Critical Rules

1. **Always accept email in user-facing flows.** Users know each other's emails, not userIds. The server resolves the userId or creates a deferred grant.

2. **Never assume a deferred grant is immediate.** Email-based grants resolve at signup, not at write time. Don't show "Alice is a member" until she actually has an `AppMembership` row (i.e. her addMember response had `status: "added"` or `"already_member"`).

3. **Never grant access just because a bookmark exists.** Bookmarks are presentational. Access comes from `DocumentPermission`, `DocumentGroupPermission`, `DatabaseGroupPermission`, or a resolved deferred grant.

4. **Check member-invitation quota before showing invite UI.** A member with a 0 quota will hit a 403; hide the button instead.

5. **Parse the 403 body for the `canRequestAccess` hint** when `documents.get` fails. The HTTP error message contains a JSON body with `{ code: "DOC_ACCESS_DENIED", canRequestAccess: bool }`.

6. **Cancel pending shares with the right call.** Email-based shares/group-adds attached to an `AppInvitation` do *not* auto-cancel when you remove a single share. Either:
   - Cancel one pending share by email: `client.documents.removePermission(docId, { email })` or `client.groups.removeMember(type, id, { email })`.
   - Cancel everything (the invite + all pending shares + all pending group adds linked to it): `client.invitations.delete(invitationId)`.

---

## Invitations

### API surface

```typescript
client.invitations.create({ email, role?, expiresAt?, source?, note?, sendEmail? }); // -> AppInvitationInfo
client.invitations.list({ limit?, cursor? });          // -> { items: AppInvitationInfo[], cursor? }   (admin/owner only)
client.invitations.delete(invitationId);               // CASCADES to deferred grants
client.invitations.quota();                            // -> { used, limit, remaining, unlimited }
client.invitations.get(invitationId);                  // -> AppInvitationInfo (includes inviteToken + status)
client.invitations.accept(inviteToken);                // authenticated cross-identity acceptance
client.invitations.listDeferredGrants({ email?, type?, limit? });  // admin debug only
client.invitations.revokeDeferredGrant(deferredId, "document" | "group");
```

`AppInvitationInfo` items returned by `list()` carry: `invitationId`, `email`, `role`, `invitedBy`, `invitedAt`, `expiresAt`, `accepted`, `acceptedAt`, `source`, `note`, `inviteToken`. The `status` field (`"pending" | "expired" | "accepted"`) is computed server-side and only returned by `get()`, not by `list()` — derive it on the client from `accepted` + `expiresAt` if you need it on a list row.

The cascading delete is `client.invitations.delete(id)` — there is **no `client.invitations.revoke()`**.

### Admin / member create

```typescript
// Admins/owners: any role
await client.invitations.create({
  email: "alice@example.com",
  role: "member", // or "admin" / "owner" (admin/owner only)
});

// Full options
await client.invitations.create({
  email: "alice@example.com",
  role: "member",
  expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(), // optional override
  source: "team-onboarding-flow",   // optional audit attribution (≤64 chars)
  note: "Backend hire — Q2 cohort", // optional, surfaces in admin UI
  sendEmail: true,                   // server-default: false. When true, the
                                     //   server delivers a default invitation
                                     //   email; otherwise the caller is
                                     //   expected to deliver the inviteToken.
});

// Members: only when memberInvitationsEnabled is true on the app, and only role: "member"
const quota = await client.invitations.quota();
if (!quota.unlimited && quota.remaining <= 0) {
  return showQuotaExhausted();
}
await client.invitations.create({ email, role: "member" });
```

`quota()` returns `{ used: 0, limit: 0, remaining: 0, unlimited: false }` for a member when `memberInvitationsEnabled` is `false` — treat that as "no quota, hide the button." Admins/owners always get `unlimited: true`.

### Server error codes (in the HTTP error body)

The client surfaces server errors as `Error("HTTP <status>: <jsonBody>")`. Parse the JSON to read `error` / `code`:

| Body shape | When |
|------------|------|
| `{ error: "INVITATION_LIMIT_REACHED", used, limit }` | Member at quota |
| `{ error: "MEMBER_INVITATIONS_DISABLED" }` | App has `memberInvitationsEnabled: false` and caller is a member |
| Plain text `"Members can only invite with role 'member'"` | Member tried `role: "admin"` |
| Plain text `"User already has a pending invitation"` | Duplicate create for the same email |
| Plain text `"User already exists in this app"` | Email is already an `AppUser` |

> **Footgun:** error bodies on this endpoint use `error`. The access-request endpoints use `code`. Don't conflate the two — read the field name that matches the endpoint you called.

### Custom invitation emails (`inviteToken`)

`AppInvitation` carries an `inviteToken`. Combine with your accept-page URL to send your own email. The token is returned **inline** when invitations are first minted:

| Where the token comes back | Field |
|---------------------------|-------|
| `client.invitations.create()` | `AppInvitationInfo.inviteToken` |
| `client.documents.updatePermissions(...)` deferred result | `DeferredPermissionGrant.inviteToken` |
| `client.groups.addMember(...)` deferred result | `DeferredGroupAdd.inviteToken` |

For resend / lookup after the initial response is gone, use `client.invitations.get(invitationId)`:

```typescript
const inv = await client.invitations.get(invitationId);
// AppInvitationInfo:
// { invitationId, email, role, invitedBy, invitedAt, expiresAt,
//   accepted, acceptedAt, source, note, inviteToken,
//   status: "pending" | "expired" | "accepted" }

const acceptUrl = `${myApp.baseUrl}/invite/accept?inviteToken=${inv.inviteToken}`;
await myEmailService.send({ to: inv.email, link: acceptUrl });
```

Permissions for `invitations.get`: app admin/owner, OR the invitation's original inviter. Members who did not create the invitation receive 403 — `inviteToken` is a bearer credential, so read access is intentionally narrow.

### Token-based acceptance (authenticated caller)

For the cases where the platform can't infer intent from the recipient's email:

- **Cross-identity acceptance** — invited at `work@example.com`, signing in as `home@gmail.com`.
- **Existing user binding a fresh deferred grant** — the invitee is already signed in to a working account and wants to redeem an invite without going through signup again.

Email-matched signup resolves deferred grants automatically — your app does NOT call accept for that path. Use `invitations.accept` only when the invitee is already authenticated as someone other than (or in addition to) the email the invitation was sent to.

```typescript
const result = await client.invitations.accept(inviteToken);
// { status: "accepted",
//   invitationId,
//   grantsResolved: { groups: 2, documents: 1 } }
```

Throws `Error("HTTP 4xx: ...")` on bad tokens. Body codes are `INVITE_TOKEN_INVALID`, `INVITE_TOKEN_EXPIRED`, `INVITE_ALREADY_ACCEPTED`.

**Template-provided acceptance page:** The template ships `InviteAcceptPage.vue` (`src/pages/InviteAcceptPage.vue`) at the route `/invite/accept?inviteToken=...`. It handles the signed-in confirmation path (calls `client.invitations.accept(token)`) and the signed-out path (stashes the token in `sessionStorage` via `src/lib/inviteToken.ts`, redirects to login, and the auth methods in `userStore` consume it automatically at sign-in). All error states are also handled. If you're using the template, point your invitation emails at `${yourApp.baseUrl}/invite/accept?inviteToken=${token}` — the page is already wired up in the router. See the [Authentication guide](AGENT_GUIDE_TO_PRIMITIVE_AUTHENTICATION.md#invite-token-persistence-across-auth-round-trips-template-pattern) for the persistence details.

---

## Document Sharing

### Direct shares: `updatePermissions`

The method is **`updatePermissions`** (no `setPermissions`). Two forms:

```typescript
// Single user (by id or email)
await client.documents.updatePermissions(documentId, {
  email: "alice@example.com",
  permission: "read-write",
});

// Batch (any mix of userId and email)
await client.documents.updatePermissions(documentId, {
  permissions: [
    { userId: "user-abc", permission: "read-write" },
    { email: "alice@example.com", permission: "reader" },
    { email: "bob@example.com",   permission: "read-write" },
  ],
});
```

Optional fields on either form: `sendEmail`, `documentUrl`, `note`.

When `sendEmail: true`, the server delivers per-recipient emails:

- **Existing app members** receive the `document-share` template, populated with the caller-supplied `documentUrl`.
- **Non-members (deferred grants)** receive the `document-share-deferred` template, populated with an accept URL composed from `app.baseUrl` + the new `inviteToken` (shape `${app.baseUrl}/invite/accept?inviteToken=...`).

Both branches share two preconditions when `sendEmail: true`: `documentUrl` must be supplied in the request, and the app must have `baseUrl` configured (so the deferred branch can compose its accept URL). Either missing returns HTTP 400 (`"documentUrl is required when sendEmail is true"` or `"Cannot send share email: app baseUrl is not configured"`). Customize either email type with `primitive email-templates set document-share ...` or `primitive email-templates set document-share-deferred ...`.

Repeated email-based calls are idempotent: a second `updatePermissions(documentId, { email })` with the same email updates the existing pending `DeferredDocumentPermission` in place rather than creating a duplicate row, so the latest `permission` value wins at signup-time resolution and `client.documents.listPendingInvitations(documentId)` shows one entry per pending recipient.

**There is no `permission: null` to remove.** Removal is a separate call:

```typescript
// Remove a current member by userId:
await client.documents.removePermission(documentId, "user-abc");
await client.documents.removePermission(documentId, { userId: "user-abc" });

// Cancel a pending email-based invite, OR remove a current member matched by email:
await client.documents.removePermission(documentId, { email: "alice@example.com" });
```

**Don't do this** (silent no-op for someone with a higher group permission, and there is no `null` form):

```typescript
// WRONG — there is no setPermissions
await client.documents.setPermissions(documentId, [
  { userId, permission: null },
]);

// WRONG — downgrades direct grant to "reader" but does NOT lower a higher
// group-derived permission. The user keeps read-write via the group.
await client.documents.updatePermissions(documentId, {
  userId, permission: "reader",
});
// Correct: also lower or revoke the group permission.
```

### Response shape

```typescript
// {
//   success: true,
//   message: "...",
//   results?: [
//     // Direct (existing user):
//     { status: "granted" | "updated", userId: "user-abc", permission: "read-write" },
//
//     // Deferred (email not yet an app user):
//     { status: "pending_signup",
//       email: "bob@example.com",
//       permission: "read-write",
//       appInvitationCreated: true,
//       invitationId: "inv-123",
//       inviteToken: "..." | null }   // combine with your accept URL
//   ]
// }
```

`results` is only present when at least one entry was deferred (i.e. the batch contained an email that didn't yet map to an app user). For all-direct grants — single-user or batch — the response is just `{ success: true, message }` with no `results` array. Branch on `status` per row when `results` is present.

### Group sharing

The method is **`grantGroupPermission`** (no `setGroupPermission`).

```typescript
// Document
await client.documents.grantGroupPermission(documentId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write",       // owner | read-write | reader
});

// Database — only "manager" is supported
await client.databases.grantGroupPermission(databaseId, {
  groupType: "team",
  groupId: "engineering",
  permission: "manager",
});

// Listing / revoking
await client.documents.listGroupPermissions(documentId);
await client.documents.revokeGroupPermission(documentId, "team", "engineering");
```

Member changes inside the group propagate automatically — no per-membership permission calls.

### Looking up users

```typescript
const result = await client.users.lookup("alice@example.com");
// { exists: true, user: { userId, name, email } }
// or { exists: false }
```

The argument is a plain string, not `{ email }`. Use this to decide whether to share by `userId` (definitive) or `email` (will defer if no app user yet).

---

## Group Membership

```typescript
// By userId — direct add against an existing app user
await client.groups.addMember("team", "engineering", { userId: "user-abc" });

// By email — direct add if email maps to an existing app user, otherwise deferred
await client.groups.addMember("team", "engineering", {
  email: "alice@example.com",
});
```

`userId` and `email` are mutually exclusive. The result is a discriminated union — branch on `status`:

```typescript
// DirectGroupAdd
// { status: "added" | "already_member",
//   userId, userName?, userEmail?, addedAt, addedBy }

// DeferredGroupAdd
// { status: "pending_signup",
//   email, appInvitationCreated, deferredId, expiresAt,
//   groupType, groupId,
//   invitationId, inviteToken }   // for custom invite emails
```

- `"added"` — new `AppMembership` row.
- `"already_member"` — idempotent no-op; the response carries the *existing* `addedAt`/`addedBy`. Replaces a previous HTTP 409.
- `"pending_signup"` — show "Will be added when Alice joins." Use `invitationId` + `inviteToken` for a custom invite email.

### Removing

```typescript
await client.groups.removeMember("team", "engineering", "user-abc");

// By email: removes a current member if one matches, otherwise cancels the
// pending DeferredGroupAdd. No need to delete the AppInvitation just to
// undo a single pending group add.
await client.groups.removeMember("team", "engineering", {
  email: "alice@example.com",
});
```

### Listing

```typescript
const { items, cursor } = await client.groups.listMembers("team", "engineering");
// items: [{ userId, addedAt, addedBy, userName?, userEmail? }, ...]
```

---

## Collection Sharing

Sharing a `DocumentCollection` (see the [Documents guide](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md#collections)) cascades access to every document inside it — current and future. Reach for collections when several documents share a sharing context.

```typescript
// Add an individual member
await client.collections.addMember(collectionId, {
  userId: "user-abc",                    // userId only — see gap below
  permission: "read-write",              // "reader" or "read-write"
});

// Share with a group (fans out to every document in the collection)
await client.collections.grantGroupPermission(collectionId, {
  groupType: "team",
  groupId: "engineering",
  permission: "reader",
});

// Inspect / undo
const access = await client.collections.getAccess(collectionId);
// → { members: [...], groups: [...] }
await client.collections.removeMember(collectionId, "user-abc");
await client.collections.revokeGroupPermission(collectionId, "team", "engineering");
```

**Cascade rule:** once a user gains access to the collection, they have access to every document in it. Don't add per-document grants for documents already shared at the collection level — the collection grant is canonical.

> **Gap (#671):** `collections.addMember` accepts `userId` only — there's no email-based deferred grant yet, and there's no `collections.listPendingInvitations` for a "Members + Pending" UI on a collection. To share a collection with someone who hasn't signed up, either invite them at the app level first (`client.invitations.create({ email })` or share an individual document with them by email so the deferred-grant flow runs) and add them to the collection after signup, or share the collection with a group they'll be a member of.

---

## Deferred Grants

Deferred grants bridge "I have an email" and "they're in the app."

### Lifecycle

1. Agent writes a grant by email for `alice@outside.com`.
2. Server creates (or reuses) an `AppInvitation` plus a `DeferredDocumentPermission` / `DeferredGroupAdd`.
3. Alice receives an invitation email (default flow) or a custom one you sent using `inviteToken`.
4. Alice signs in with `alice@outside.com` (any auth method). The signup flow resolves *every* pending deferred grant for that email in one transaction — **no manual `accept` call is required for the standard email-match path**. If Alice wants to accept under a different identity (signed in as `home@gmail.com` but redeeming an invite sent to `work@example.com`), call `client.invitations.accept(inviteToken)` from that session.

### Domain-mode apps

Deferred grants are re-validated at resolution time. In a domain-restricted app, a grant for an email outside the allowed domains is silently dropped at resolution and the invitation is rejected. Don't use deferred grants as a side channel around domain policy.

### Inspecting pending state (debug only)

```typescript
const { grants, nextCursor } = await client.invitations.listDeferredGrants({
  email: "alice@example.com",
});
```

Reserve this for admin/debug UIs. For end-user "people with access + pending invitations" UI, use the per-resource endpoints in the next section.

---

## Document Access Requests

The owner UI when a non-member hits a 403 they're allowed to escalate.

### Detect on `documents.get` failure

The 403 body is JSON shaped `{ error, status, timestamp, code: "DOC_ACCESS_DENIED", details: { code: "DOC_ACCESS_DENIED", canRequestAccess: boolean } }`. The thrown error is a plain `Error` whose message embeds the body — parse it:

```typescript
try {
  const doc = await client.documents.get(documentId);
} catch (err) {
  const body = parseHttpErrorBody(err); // your helper — JSON.parse the bit after "HTTP 403: "
  if (body?.code === "DOC_ACCESS_DENIED" && body.details?.canRequestAccess) {
    await client.documents.requestAccess(documentId, {
      permission: "read-write",                  // REQUIRED
      message: "Working on the Q2 planning deck",
    });
    showPendingUI();
  } else {
    showHardDeniedUI();
  }
}

function parseHttpErrorBody(err: unknown): any | null {
  const m = String((err as Error)?.message || "").match(/^HTTP \d+:\s*(.*)$/s);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}
```

`canRequestAccess` returns `true` only when:
- Caller is an `AppUser` (regular member, not anonymous).
- Caller is **not** an admin/owner (they already have access).
- Document exists, is not the root document.
- Caller has no existing direct or group permission.

### `requestAccess` requires `permission`

```typescript
await client.documents.requestAccess(documentId, {
  permission: "read-write",          // REQUIRED — "read-write" or "reader"
  message: "...",                    // optional, max 500 chars
  documentUrl: "https://...",        // optional, embedded in owner email
  reviewUrl: "https://...",          // optional, owner's review CTA
  sendEmail: false,                  // optional, default true
});
```

Calling with no `permission` will 400. Re-requesting from the same user updates the existing pending request silently — there is no `ACCESS_REQUEST_ALREADY_PENDING` error. Real codes:

| Body code | When |
|-----------|------|
| `ALREADY_HAS_ACCESS` | Caller already has any permission |
| `RATE_LIMITED` | Too many requests; body has `retryAfter` |
| `ACCESS_REQUEST_ALREADY_RESOLVED` | Approve/deny called on a non-pending request |

### Owner / admin flow

```typescript
const requests = await client.documents.listAccessRequests(documentId);
// DocumentAccessRequest[]: { requestId, requesterId, status, requestedPermission, message?, ... }

await client.documents.approveAccessRequest(documentId, requestId, {
  permission: "read-write",          // optional override
  documentUrl: "https://...",        // optional, embedded in approval email
});

await client.documents.denyAccessRequest(documentId, requestId, {
  documentUrl: "https://...",        // optional
});
```

> **Note:** `denyAccessRequest` does not accept a `reason` field — only `documentUrl`. Don't try to pass one.

### Real-time delivery

The server pushes WS frames `document:access-request-created` (to owners/admins) and `document:access-request-resolved` (to the requester). **These are not currently surfaced as typed `client.on(...)` events.** Only `invitation` is surfaced. For now, poll `listAccessRequests()` on the owner side, and check `documents.get` again on the requester side after a sensible interval, or wire your own WS frame handler if you need lower latency.

### Constraints

- 30-day TTL on unresolved requests.
- One pending request per `(document, requester)` — re-requesting updates it in place.
- Resolved requests are immutable.

---

## Bookmarks

### API

```typescript
await client.me.bookmarks.add({
  targetObjType: "d",                              // documents are "d", not "document"
  targetObjId: documentId,
  key: "projects/acme/q2-planning",                // optional; default `${type}/${id}`
});

const { bookmarks, nextCursor } = await client.me.bookmarks.list({
  prefix: "projects/acme/",
  limit: 100,
});

await client.me.bookmarks.rename(oldKey, newKey);
await client.me.bookmarks.remove(key);
```

`add()` returns `{ status: "added" | "already_bookmarked", key, targetObjType, targetObjId, bookmarkedAt }`. Today only `targetObjType: "d"` (document) is registered. Adding for an unsupported type returns `{ code: "UNKNOWN_TARGET_TYPE" }`.

### Design guidelines

1. **`me.bookmarks.list` is the primary "my documents" UI.** It's the user-curated list and the platform pre-populates it for the common cases — auto-bookmark on document creation and on deferred-grant resolution at signup, auto-removal on permission revoke. For everyday "my stuff" UI, lead with bookmarks; users can drop bookmarks they don't want without losing access, and add bookmarks for shares they want to keep handy.

2. **Use hierarchical `key`s.** `projects/acme/q2-planning` is better than `q2-planning` because prefix queries let you organize folders cheaply. The field on the request is `key`; the server stores it as `userDefinedKey`.

3. **Use `client.me.sharedDocuments()` for the inbox view** — "things directly shared with me that aren't on my curated list yet." It returns documents the user has a non-owner `DocumentPermission` on plus pending `DocumentInvitation`s; group- and collection-shared docs do **not** appear here (they show up only when the user bookmarks them, or when you query `groups.listDocuments` / `collections.listDocuments` directly).

4. **Auto-bookmarks happen server-side** on document creation and on deferred-grant resolution at signup. Direct grants to existing users (by `userId`) do not auto-bookmark — the recipient sees them in `me.sharedDocuments` until they bookmark them. Don't double-create bookmarks from the client.

5. **Bookmarks are purely presentational.** Never make access decisions based on bookmark existence.

---

## Discovery cheat sheet

Pick the call that answers the question you're actually asking. The most common UX questions and the right call:

| Question | Call |
|----------|------|
| **"My documents" home view** (created + bookmarked shares/collections/groups) — preferred | `client.me.bookmarks.list({ prefix?, cursor?, limit? })` |
| Documents I created (the definitive owned list, even ones I un-bookmarked) | `client.documents.list({ limit?, cursor?, tag?, returnPage? })` — actually returns docs where I have a direct `DocumentPermission` (owner + reader/read-write); use it when you specifically need that scope |
| Documents directly shared with me that aren't on my curated list yet | `client.me.sharedDocuments({ cursor?, limit? })` |
| Documents inside a collection | `client.collections.listDocuments(collectionId, { limit?, cursor? })` |
| Documents shared with a group | `client.groups.listDocuments(groupType, groupId)` |
| Collections I'm a direct member of | `client.collections.list({ limit?, cursor? })` |
| Members of a group | `client.groups.listMembers(groupType, groupId, { limit?, cursor? })` |
| Members + groups on a collection | `client.collections.getAccess(collectionId)` |
| Group permissions on a document | `client.documents.listGroupPermissions(documentId)` |
| **Pending email invites on a document** (for "Members + Pending" UI) | `client.documents.listPendingInvitations(documentId)` |
| **Pending email invites on a group** (for "Members + Pending" UI) | `client.groups.listPendingInvitations(groupType, groupId)` |

**Anti-patterns:**

- Filtering `me.bookmarks.list` to build a "shared with me" inbox — bookmarks miss shares the user never bookmarked. Use `me.sharedDocuments` for that.
- Polling `client.invitations.list` (or `listDeferredGrants`) to populate "Members + Pending" rows — those are app-level / admin surfaces. Per-resource `listPendingInvitations` is the product UI source.
- Calling `documents.list` to render a "my documents" home view — it doesn't include group- or collection-shared docs, and it surfaces docs the user un-bookmarked. Lead with `me.bookmarks.list`.

---

## WebSocket Events

```typescript
// Invitation lifecycle (the ONLY typed sharing event today).
// The action is on event.action — NOT event.type. event.type === "invitation" always.
client.on("invitation", (event) => {
  switch (event.action) {
    case "created":   /* invitee only */ break;
    case "updated":   /* invitee only */ break;
    case "cancelled": /* invitee only */ break;
    case "declined":  /* both invitee and inviter */ break;
    case "accepted":  /* inviter only — event.acceptedBy carries the userId */ break;
    default: /* future-proof: no-op, don't throw */ break;
  }
});
```

**Targeting is asymmetric** — most actions go to one side only. `accepted` goes to the *inviter*; `created` goes to the *invitee*. Don't expect both sides to see the same events.

`document:access-request-created` and `document:access-request-resolved` are emitted by the server on the WS but are **not** dispatched to typed `client.on(...)` channels yet. Plan accordingly.

---

## Building a "Members + Pending" UI

The canonical sharing panel: people with access + people invited but not yet signed up.

### Current members

```typescript
// Document
const members = await client.documents.getPermissions(documentId);
// [{ userId, email, name, permission, grantedAt }, ...]

// Group
const { items: groupMembers } = await client.groups.listMembers(groupType, groupId);
// [{ userId, addedAt, addedBy, userName?, userEmail? }, ...]
```

> The method is `getPermissions`, not `listPermissions`.

### Pending invitations — per-resource (the one to use)

Each shareable resource exposes a denormalized endpoint so callers don't have to filter the app-level list:

```typescript
// Pending document shares for one document
const docPending = await client.documents.listPendingInvitations(documentId);
// [{ email, permission, invitationId, createdAt, expiresAt, grantedBy? }]

// Pending group adds for one group
const groupPending = await client.groups.listPendingInvitations(groupType, groupId);
// [{ email, role, invitationId, createdAt, expiresAt, addedBy? }]
```

Don't reach into `client.invitations.listDeferredGrants(...)` for product UI — that's the admin-debug surface.

### Pending invitations — app-level

```typescript
const { items, cursor } = await client.invitations.list({ limit: 50 });
const pending = items.filter((i) => !i.accepted);
// [{ invitationId, email, role, invitedAt, expiresAt, accepted, acceptedAt,
//    source, note }, ...]
// Note: list responses do NOT include `inviteToken` — fetch it per-row via
// `client.invitations.get(invitationId)` if you need it.
```

Use this for "all open invitations to this app" — admin/owner only. For per-resource UI, use the per-resource endpoints above.

### Canonical "share + render" flow

```typescript
async function shareAndReload(documentId: string, email: string) {
  const result = await client.documents.updatePermissions(documentId, {
    email,
    permission: "read-write",
  });
  // result.results is present only when at least one row was deferred
  // (email didn't yet map to an app user). All-direct grants return just
  // { success, message } — that's success; refetch the panel.

  const [members, pending] = await Promise.all([
    client.documents.getPermissions(documentId),
    client.documents.listPendingInvitations(documentId),
  ]);
  return { members, pending };
}
```

### Cancelling

```typescript
// Cancel one pending share:
await client.documents.removePermission(documentId, { email });

// Cancel one pending group add:
await client.groups.removeMember(groupType, groupId, { email });

// Nuclear: cancel the whole AppInvitation, cascading every pending
// document share and group add linked to it. Use this when the user
// chooses "uninvite this person from the app entirely."
await client.invitations.delete(invitationId);
```

> **Don't do this:** call `client.invitations.delete(...)` to cancel a single document share. It will also cancel every other pending share and group add for that invitation.

### Removing someone who already has access

```typescript
// Document
await client.documents.removePermission(documentId, userId);

// Group
await client.groups.removeMember(groupType, groupId, userId);
```

Removing yourself from a document also evicts the local copy.

---

## Common Patterns

### Onboard a teammate end-to-end

```typescript
async function onboardTeammate(email: string, projectDocId: string) {
  const quota = await client.invitations.quota();
  if (!quota.unlimited && quota.remaining <= 0) {
    throw new Error("Invitation quota exhausted");
  }

  await client.invitations.create({ email, role: "member" });

  await client.documents.updatePermissions(projectDocId, {
    permissions: [{ email, permission: "read-write" }],
  });

  await client.groups.addMember("team", "engineering", { email });
}
```

After signup all three resolve in one server-side transaction.

### Team access + external reviewer

```typescript
// Team-wide access via group
await client.documents.grantGroupPermission(docId, {
  groupType: "team",
  groupId: "engineering",
  permission: "read-write",
});

// External reviewer, read-only
await client.documents.updatePermissions(docId, {
  email: "reviewer@external.com",
  permission: "reader",
});
```

### Request-access fallback for hard 403

```typescript
const body = parseHttpErrorBody(err);
if (body?.code === "DOC_ACCESS_DENIED" && body.details?.canRequestAccess) {
  showRequestAccessButton();
} else {
  showHardDeniedScreen();
}
```

---

## Anti-Patterns

- Calling a method that doesn't exist: `setPermissions`, `setGroupPermission`, `client.invitations.revoke`, `client.deferredGrants.list`, `client.users.lookup({ email })`. The correct names are `updatePermissions`, `grantGroupPermission`, `client.invitations.delete`, `client.invitations.listDeferredGrants`, `client.users.lookup(email)`.
- Passing `permission: null` to remove a grant — there is no null form. Use `removePermission`.
- Lowering a user's direct permission while they still have a higher one via group — the group wins (effective = MAX).
- Filtering bookmarks to build "shared with me." Use `client.me.sharedDocuments()`.
- Making access decisions based on bookmark membership.
- Showing a "request access" button without parsing the 403 body for `details.canRequestAccess`.
- Calling `client.invitations.delete()` to cancel a single pending document share — it cascades to every share and group add linked to that invitation.
- Polling `invitations.list()` for acceptance. Subscribe to `client.on("invitation", ...)` and switch on `event.action === "accepted"` (delivered to the inviter).
- Listening for `client.on("document:access-request-resolved", ...)` — that channel doesn't exist client-side.
- Using `targetObjType: "document"` for bookmarks — it's `"d"`.

---

## Error Codes Quick Reference

Server-emitted body codes. The client throws `Error("HTTP <status>: <body>")`; parse the body to read these.

| Code / `error` field | Endpoint | Meaning |
|----------------------|----------|---------|
| `DOC_ACCESS_DENIED` (with `details.canRequestAccess`) | `documents.get` | 403; check the hint to decide between request-access UI and hard deny |
| `INVITATION_LIMIT_REACHED` | `invitations.create` | Member at quota; body has `used`, `limit` |
| `MEMBER_INVITATIONS_DISABLED` | `invitations.create` | App has member invitations off and caller is a member |
| `ALREADY_HAS_ACCESS` | `requestAccess` | Caller already has a direct or group permission |
| `RATE_LIMITED` | `requestAccess` | Body has `retryAfter` (seconds) |
| `ACCESS_REQUEST_ALREADY_RESOLVED` | `approveAccessRequest`, `denyAccessRequest` | Request is no longer pending |
| `INVITE_TOKEN_INVALID` | `invitations.accept` | Token doesn't decode |
| `INVITE_TOKEN_EXPIRED` | `invitations.accept` | Past `expiresAt` |
| `INVITE_ALREADY_ACCEPTED` | `invitations.accept` | Token already redeemed |
| `UNKNOWN_TARGET_TYPE` | `me.bookmarks.add` | `targetObjType` not registered (only `"d"` today) |
| `TARGET_ACCESS_DENIED` | `me.bookmarks.add` | Caller has no permission to the bookmarked target |

---

## Related Guides

- [Documents](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md) — Document permissions, the base layer for sharing
- [Users and Groups](AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.md) — Groups and CEL
- [Authentication](AGENT_GUIDE_TO_PRIMITIVE_AUTHENTICATION.md) — How signup triggers deferred-grant resolution
