# documents — `client.documents`

Create, open, share, and sync collaborative Yjs documents. Blob attachments are a separate surface ([`client.documents.blobs(id)`](/blobs)) and are not covered here.

## create(options)

Create a new document. Pass `localOnly: true` to defer the server commit.

::: warning Divergent behavior (alignment deferred)
JS `documents.create` is local-first: it writes the document locally and returns immediately, then commits to the server in the background (honoring `localOnly`). Swift's `documents.create` POSTs synchronously and has no offline/deferred path here — so a create issued while offline fails rather than queueing (sweep D2, [#852](https://github.com/Primitive-Labs/js-bao-wss/issues/852)). The local-first flow **does** exist on Swift via the top-level `client.createDocument(options:)`; routing `documents.create` (and adding `commitOfflineCreate`) through it is a larger change deferred for now.
:::

::: code-group
<<< ./snippets/documents/create.ts#example{ts} [JavaScript]
<<< ./snippets/documents/create.swift#example{swift} [Swift]
:::

## createWithAlias(options)

Create a document and assign an alias atomically, failing if the alias exists.

::: code-group
<<< ./snippets/documents/create-with-alias.ts#example{ts} [JavaScript]
<<< ./snippets/documents/create-with-alias.swift#example{swift} [Swift]
:::

## getOrCreateWithAlias(options)

Resolve an alias to a document, creating one if it doesn't exist yet (singleton docs).

::: code-group
<<< ./snippets/documents/get-or-create-with-alias.ts#example{ts} [JavaScript]
<<< ./snippets/documents/get-or-create-with-alias.swift#example{swift} [Swift]
:::

## list(options?)

List documents accessible to the current user. Deprecated in favor of `client.me.ownedDocuments()` / `client.me.sharedDocuments()` ([#628](https://github.com/Primitive-Labs/js-bao-wss/issues/628)).

::: tip Divergent shape (alignment deferred)
Swift returns a typed `[DocumentInfo]` but only supports `limit`/`cursor` pagination. JS adds `tag`, `forward`, `waitForLoad`, `refreshFromServer`, `localOnly`, and a `returnPage` array-vs-page duality ([#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)). Since `list` is deprecated in both clients (use `me.ownedDocuments()` / `me.sharedDocuments()`), expanding its options is deferred — the option-parity work belongs on the `me.*` surface.
:::

::: code-group
<<< ./snippets/documents/list.ts#example{ts} [JavaScript]
<<< ./snippets/documents/list.swift#example{swift} [Swift]
:::

## get(documentId)

Fetch a document's metadata from the server as a typed `DocumentInfo` (with `documentId`, `title`, `lastModified`, `permission`, `tags`, `thumbnailBlobId`, `metadata`, …). The Swift client decodes the wire's `modifiedAt` field into `lastModified` so the property matches JS ([#673](https://github.com/Primitive-Labs/js-bao-wss/issues/673)).

::: code-group
<<< ./snippets/documents/get.ts#example{ts} [JavaScript]
<<< ./snippets/documents/get.swift#example{swift} [Swift]
:::

## update(documentId, data)

Update document metadata. Replace semantics: omit a key to leave it unchanged, pass `null` to clear it.

::: code-group
<<< ./snippets/documents/update.ts#example{ts} [JavaScript]
<<< ./snippets/documents/update.swift#example{swift} [Swift]
:::

## addTag(documentId, tag)

Add a tag to a document. Returns the updated tag list.

::: code-group
<<< ./snippets/documents/add-tag.ts#example{ts} [JavaScript]
<<< ./snippets/documents/add-tag.swift#example{swift} [Swift]
:::

## removeTag(documentId, tag)

Remove a tag from a document. Returns the updated tag list.

::: code-group
<<< ./snippets/documents/remove-tag.ts#example{ts} [JavaScript]
<<< ./snippets/documents/remove-tag.swift#example{swift} [Swift]
:::

## delete(documentId, opts?)

Delete a document from the server and evict its local data.

::: tip Now aligned
Both clients return `void`. Swift now matches JS's post-delete reconciliation: it evicts the document's local data, emits a `documentMetadataChanged` (`action: "deleted"`) event, and treats a `404`/offline response as an already-applied delete (offline-fallback) instead of throwing ([#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961)).
:::

::: code-group
<<< ./snippets/documents/delete.ts#example{ts} [JavaScript]
<<< ./snippets/documents/delete.swift#example{swift} [Swift]
:::

## open(documentId, options?)

Open a document for editing.

::: tip Divergent shape (kept by design)
JS returns `{ doc, metadata }`; Swift returns the `YDocument` directly and takes a typed `OpenDocumentOptions`. The bare `YDocument` is the ergonomic Swift shape — aligning the return to a `{ doc, metadata }` tuple is deferred rather than treated as a gap.
:::

::: code-group
<<< ./snippets/documents/open.ts#example{ts} [JavaScript]
<<< ./snippets/documents/open.swift#example{swift} [Swift]
:::

## openRoot()

Open the app's shared root document for editing.

::: code-group
<<< ./snippets/documents/open-root.ts#example{ts} [JavaScript]
<<< ./snippets/documents/open-root.swift#example{swift} [Swift]
:::

## close(documentId, options?)

Close an open document, optionally evicting its local data.

::: tip Now aligned
Both clients return `{ evicted }`. Swift mirrors JS's guard: when `evictLocal` is set, local data is evicted only if the server already has all of this client's writes — otherwise it's kept and `evicted` is `false` ([#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961)).
:::

::: code-group
<<< ./snippets/documents/close.ts#example{ts} [JavaScript]
<<< ./snippets/documents/close.swift#example{swift} [Swift]
:::

## getRoot()

Fetch metadata for the app's shared root document.

::: code-group
<<< ./snippets/documents/get-root.ts#example{ts} [JavaScript]
<<< ./snippets/documents/get-root.swift#example{swift} [Swift]
:::

## openAlias(params, options?)

Resolve an alias and open the document it points at in one call.

::: tip Divergent shape
JS returns `{ doc, metadata }`; Swift returns the `YDocument` directly (consistent with `open`). Swift resolves the alias via `aliases.resolve` then opens.
:::

::: code-group
<<< ./snippets/documents/open-alias.ts#example{ts} [JavaScript]
<<< ./snippets/documents/open-alias.swift#example{swift} [Swift]
:::

## getPermissions(documentId)

List the users who have permissions on a document.

::: code-group
<<< ./snippets/documents/get-permissions.ts#example{ts} [JavaScript]
<<< ./snippets/documents/get-permissions.swift#example{swift} [Swift]
:::

## updatePermissions(documentId, data)

Grant or change a user's permission. By email it routes through the deferred-grant flow, so it doubles as "invite to this doc".

::: code-group
<<< ./snippets/documents/update-permissions.ts#example{ts} [JavaScript]
<<< ./snippets/documents/update-permissions.swift#example{swift} [Swift]
:::

## removePermission(documentId, target)

Revoke a user's access, or cancel a pending email invitation.

::: tip Divergent shape
JS takes a `string | { userId } | { email }` union; Swift splits it into `userId:` / `email:` overloads. Both return `void`.
:::

::: tip Now aligned
Self-removal eviction now matches JS: removing *your own* permission (the `userId:` overload, matched against the current user) evicts the document's local data, since you can no longer sync it ([#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961)).
:::

::: code-group
<<< ./snippets/documents/remove-permission.ts#example{ts} [JavaScript]
<<< ./snippets/documents/remove-permission.swift#example{swift} [Swift]
:::

## transferOwnership(documentId, newOwnerId)

Transfer document ownership to another user.

::: code-group
<<< ./snippets/documents/transfer-ownership.ts#example{ts} [JavaScript]
<<< ./snippets/documents/transfer-ownership.swift#example{swift} [Swift]
:::

## listPendingInvitations(documentId)

List pending (deferred) email invitations scoped to a document.

::: code-group
<<< ./snippets/documents/list-pending-invitations.ts#example{ts} [JavaScript]
<<< ./snippets/documents/list-pending-invitations.swift#example{swift} [Swift]
:::

## listGroupPermissions(documentId, options?)

List group-based permissions on a document. Both clients exclude
platform-managed internal groups (`groupType` prefixed with `_`, e.g. the
`_col-*` groups backing collection sharing) by default; pass
`includeSystem: true` to surface them ([#506](https://github.com/Primitive-Labs/js-bao-wss/issues/506)).

::: code-group
<<< ./snippets/documents/list-group-permissions.ts#example{ts} [JavaScript]
<<< ./snippets/documents/list-group-permissions.swift#example{swift} [Swift]
:::

## grantGroupPermission(documentId, params)

Grant a group a permission level on a document.

::: code-group
<<< ./snippets/documents/grant-group-permission.ts#example{ts} [JavaScript]
<<< ./snippets/documents/grant-group-permission.swift#example{swift} [Swift]
:::

## revokeGroupPermission(documentId, groupType, groupId)

Revoke a group's permission on a document. Both clients return a typed `{ success }`.

::: code-group
<<< ./snippets/documents/revoke-group-permission.ts#example{ts} [JavaScript]
<<< ./snippets/documents/revoke-group-permission.swift#example{swift} [Swift]
:::

## validateAccess(documentId)

Check the current user's access to a document.

::: code-group
<<< ./snippets/documents/validate-access.ts#example{ts} [JavaScript]
<<< ./snippets/documents/validate-access.swift#example{swift} [Swift]
:::

## requestAccess(documentId, options)

Request access to a document you don't currently have permission on.

::: code-group
<<< ./snippets/documents/request-access.ts#example{ts} [JavaScript]
<<< ./snippets/documents/request-access.swift#example{swift} [Swift]
:::

## listAccessRequests(documentId)

List pending access requests for a document (owner/admin only).

::: code-group
<<< ./snippets/documents/list-access-requests.ts#example{ts} [JavaScript]
<<< ./snippets/documents/list-access-requests.swift#example{swift} [Swift]
:::

## approveAccessRequest(documentId, requestId, options?)

Approve a pending access request (owner/admin only).

::: code-group
<<< ./snippets/documents/approve-access-request.ts#example{ts} [JavaScript]
<<< ./snippets/documents/approve-access-request.swift#example{swift} [Swift]
:::

## denyAccessRequest(documentId, requestId, options?)

Deny a pending access request (owner/admin only).

::: code-group
<<< ./snippets/documents/deny-access-request.ts#example{ts} [JavaScript]
<<< ./snippets/documents/deny-access-request.swift#example{swift} [Swift]
:::

## inSync(documentId, timeoutMs?)

Check whether client and server hold identical document state.

::: tip Divergent by design
JS does an async state-vector round-trip over the WebSocket; Swift keeps this as a cheap **synchronous local read**. The async network-round-trip behavior is available separately on Swift via `waitForInSync` / `waitForWriteConfirmation`, so this divergence is intentional rather than a gap.
:::

::: code-group
<<< ./snippets/documents/in-sync.ts#example{ts} [JavaScript]
<<< ./snippets/documents/in-sync.swift#example{swift} [Swift]
:::

## includesWrites(documentId, timeoutMs?)

Check whether the server has all of this client's writes.

::: tip Divergent by design
JS does an async state-vector round-trip over the WebSocket; Swift keeps this as a cheap **synchronous local read**. The async network-round-trip behavior is available separately on Swift via `waitForInSync` / `waitForWriteConfirmation`, so this divergence is intentional rather than a gap.
:::

::: code-group
<<< ./snippets/documents/includes-writes.ts#example{ts} [JavaScript]
<<< ./snippets/documents/includes-writes.swift#example{swift} [Swift]
:::

## waitForWriteConfirmation(documentId, timeoutMs?, pollMs?)

Wait until the server confirms it has all of this client's writes.

::: tip Divergent shape
JS resolves to a `boolean`; Swift throws on timeout.
:::

::: code-group
<<< ./snippets/documents/wait-for-write-confirmation.ts#example{ts} [JavaScript]
<<< ./snippets/documents/wait-for-write-confirmation.swift#example{swift} [Swift]
:::

## waitForInSync(documentId, timeoutMs?, pollMs?)

Wait until client and server hold identical document state.

::: code-group
<<< ./snippets/documents/wait-for-in-sync.ts#example{ts} [JavaScript]
<<< ./snippets/documents/wait-for-in-sync.swift#example{swift} [Swift]
:::

## isSynced(documentId)

Check whether a document's local state is synced (synchronous, local). On
Swift this is an alias of `inSync(...)`.

::: code-group
<<< ./snippets/documents/is-synced.ts#example{ts} [JavaScript]
<<< ./snippets/documents/is-synced.swift#example{swift} [Swift]
:::

## isOpen(documentId)

Check whether a document is currently open (synchronous, local).

::: code-group
<<< ./snippets/documents/is-open.ts#example{ts} [JavaScript]
<<< ./snippets/documents/is-open.swift#example{swift} [Swift]
:::

## isReadOnly(documentId)

Check whether a document is read-only for the current user (i.e. the cached
permission is `reader`).

::: code-group
<<< ./snippets/documents/is-read-only.ts#example{ts} [JavaScript]
<<< ./snippets/documents/is-read-only.swift#example{swift} [Swift]
:::

## listOpen()

List the IDs of all currently open documents (synchronous, local).

::: code-group
<<< ./snippets/documents/list-open.ts#example{ts} [JavaScript]
<<< ./snippets/documents/list-open.swift#example{swift} [Swift]
:::

## getDocumentPermission(documentId)

Get the current user's permission level for a document (local).

::: tip Divergent by design
JS returns a string literal union (or `null`); Swift returns a typed `DocumentPermission?` enum. Swift's typed enum is the idiomatic, safer shape — this divergence is intentional and kept.
:::

::: code-group
<<< ./snippets/documents/get-document-permission.ts#example{ts} [JavaScript]
<<< ./snippets/documents/get-document-permission.swift#example{swift} [Swift]
:::

## getLocalMetadata(documentId)

Get locally cached metadata for a document.

::: tip Divergent by design
JS is an async accessor (IndexedDB is inherently asynchronous); Swift reads synchronously from local SQLite. This is a platform constraint, not a gap.
:::

::: code-group
<<< ./snippets/documents/get-local-metadata.ts#example{ts} [JavaScript]
<<< ./snippets/documents/get-local-metadata.swift#example{swift} [Swift]
:::

## evict(documentId, opts?)

Evict a single document's local data from the device.

::: tip Divergent shape
JS accepts `{ force }`; the Swift wrapper takes no options and does not throw.
:::

::: code-group
<<< ./snippets/documents/evict.ts#example{ts} [JavaScript]
<<< ./snippets/documents/evict.swift#example{swift} [Swift]
:::

## evictAll(opts?)

Evict all locally stored document data.

::: tip Divergent shape
JS accepts `{ onlySynced }`; the Swift wrapper takes no options (evicts everything).
:::

::: code-group
<<< ./snippets/documents/evict-all.ts#example{ts} [JavaScript]
<<< ./snippets/documents/evict-all.swift#example{swift} [Swift]
:::

## isPendingCreate(documentId)

Check whether a document has a pending local create not yet committed.

::: code-group
<<< ./snippets/documents/is-pending-create.ts#example{ts} [JavaScript]
<<< ./snippets/documents/is-pending-create.swift#example{swift} [Swift]
:::

## hasLocalCopy(documentId)

Check whether a document has a local copy stored on this device.

::: code-group
<<< ./snippets/documents/has-local-copy.ts#example{ts} [JavaScript]
<<< ./snippets/documents/has-local-copy.swift#example{swift} [Swift]
:::

## listPendingCreates()

List documents created locally but not yet committed to the server.

::: tip Divergent shape
JS is async and returns `{ documentId, title?, createdAt }` objects; Swift is synchronous and returns just the `[String]` document IDs.
:::

::: code-group
<<< ./snippets/documents/list-pending-creates.ts#example{ts} [JavaScript]
<<< ./snippets/documents/list-pending-creates.swift#example{swift} [Swift]
:::

## commitOfflineCreate(documentId, opts?)

Commit a locally-created (`localOnly`) document to the server.

::: warning No Swift equivalent (deferred)
JavaScript-only — `documents.commitOfflineCreate` isn't exposed on Swift. It's paired with the deferred local-first `documents.create` work (see [create](#create-options)): the underlying flow exists via `client.createDocument`, but the explicit offline-create/commit surface on `documents.*` is deferred ([#852](https://github.com/Primitive-Labs/js-bao-wss/issues/852)).
:::

<<< ./snippets/documents/commit-offline-create.ts#example{ts} [JavaScript]

## cancelPendingCreate(documentId, opts?)

Cancel a pending local create.

::: tip Divergent shape
JS accepts `{ evictLocal }` and may throw; the Swift wrapper takes no options and does not throw.
:::

::: code-group
<<< ./snippets/documents/cancel-pending-create.ts#example{ts} [JavaScript]
<<< ./snippets/documents/cancel-pending-create.swift#example{swift} [Swift]
:::

## getOwner(documentId)

Fetch a document and extract its owner id.

::: warning Swift-only
Swift-only convenience. In JavaScript, read `createdBy` off `documents.get(id)` directly.
:::

<<< ./snippets/documents/get-owner.swift#example{swift} [Swift]

## setAwareness(documentId, state)

Broadcast the local user's awareness state (e.g. cursor) for a document.

::: warning No Swift equivalent (deferred)
JavaScript-only — the awareness/presence subsystem (cursors/selections over the WebSocket) is not in the Swift v1 surface. Bringing it to Swift is a sizeable standalone effort, deferred rather than treated as a per-method gap.
:::

<<< ./snippets/documents/set-awareness.ts#example{ts} [JavaScript]

## getAwarenessStates(documentId)

Get all current awareness states for a document.

::: warning No Swift equivalent (deferred)
JavaScript-only — the awareness/presence subsystem (cursors/selections over the WebSocket) is not in the Swift v1 surface. Bringing it to Swift is a sizeable standalone effort, deferred rather than treated as a per-method gap.
:::

<<< ./snippets/documents/get-awareness-states.ts#example{ts} [JavaScript]

## removeAwareness(documentId, clientIds, reason?)

Remove awareness states for specific clients (e.g. on timeout).

::: warning No Swift equivalent (deferred)
JavaScript-only — the awareness/presence subsystem (cursors/selections over the WebSocket) is not in the Swift v1 surface. Bringing it to Swift is a sizeable standalone effort, deferred rather than treated as a per-method gap.
:::

<<< ./snippets/documents/remove-awareness.ts#example{ts} [JavaScript]

## createInvitation(documentId, email, permission, options?)

::: danger Deprecated
Prefer [`updatePermissions`](#updatepermissions-documentid-data) with `{ email, permission }`. The legacy per-document invitation model is invisible to `listPendingInvitations` ([#619](https://github.com/Primitive-Labs/js-bao-wss/issues/619)).
:::

Create a legacy per-document invitation by email. In Swift this method is named `sendInvitation`.

::: code-group
<<< ./snippets/documents/create-invitation.ts#example{ts} [JavaScript]
<<< ./snippets/documents/create-invitation.swift#example{swift} [Swift]
:::

## listInvitations(documentId)

::: danger Deprecated
Prefer [`listPendingInvitations`](#listpendinginvitations-documentid) ([#619](https://github.com/Primitive-Labs/js-bao-wss/issues/619)).
:::

::: code-group
<<< ./snippets/documents/list-invitations.ts#example{ts} [JavaScript]
<<< ./snippets/documents/list-invitations.swift#example{swift} [Swift]
:::

## getInvitation(documentId, email)

::: danger Deprecated
Prefer `client.invitations.get(invitationId)` or [`listPendingInvitations`](#listpendinginvitations-documentid) ([#619](https://github.com/Primitive-Labs/js-bao-wss/issues/619)).
:::

::: code-group
<<< ./snippets/documents/get-invitation.ts#example{ts} [JavaScript]
<<< ./snippets/documents/get-invitation.swift#example{swift} [Swift]
:::

## updateInvitation(documentId, email, permission, options?)

::: danger Deprecated
Prefer [`updatePermissions`](#updatepermissions-documentid-data) — it is idempotent ([#619](https://github.com/Primitive-Labs/js-bao-wss/issues/619)).
:::

::: code-group
<<< ./snippets/documents/update-invitation.ts#example{ts} [JavaScript]
<<< ./snippets/documents/update-invitation.swift#example{swift} [Swift]
:::

## deleteInvitation(documentId, invitationId)

::: danger Deprecated
Prefer [`removePermission`](#removepermission-documentid-target) with `{ email }`, or `client.invitations.delete(invitationId)` ([#619](https://github.com/Primitive-Labs/js-bao-wss/issues/619)).
:::

::: code-group
<<< ./snippets/documents/delete-invitation.ts#example{ts} [JavaScript]
<<< ./snippets/documents/delete-invitation.swift#example{swift} [Swift]
:::

## acceptInvitation(documentId)

::: danger Deprecated
The per-document accept concept was removed — shares to existing users take effect immediately ([#619](https://github.com/Primitive-Labs/js-bao-wss/issues/619)).
:::

::: code-group
<<< ./snippets/documents/accept-invitation.ts#example{ts} [JavaScript]
<<< ./snippets/documents/accept-invitation.swift#example{swift} [Swift]
:::

## declineInvitation(documentId, invitationId)

::: danger Deprecated
No invitee-side decline verb — pending invitations expire automatically. To leave an accepted share, call [`removePermission`](#removepermission-documentid-target) with your own user id ([#619](https://github.com/Primitive-Labs/js-bao-wss/issues/619)).
:::

::: code-group
<<< ./snippets/documents/decline-invitation.ts#example{ts} [JavaScript]
<<< ./snippets/documents/decline-invitation.swift#example{swift} [Swift]
:::

## aliases.set(params)

Create or update a document alias. Both clients take a typed `SetAliasParams` (`scope: .app | .user`) and return `DocumentAliasInfo`.

::: code-group
<<< ./snippets/documents/aliases-set.ts#example{ts} [JavaScript]
<<< ./snippets/documents/aliases-set.swift#example{swift} [Swift]
:::

## aliases.resolve(params)

Resolve an alias to its document (null if not found).

::: code-group
<<< ./snippets/documents/aliases-resolve.ts#example{ts} [JavaScript]
<<< ./snippets/documents/aliases-resolve.swift#example{swift} [Swift]
:::

## aliases.delete(params)

Delete a document alias.

::: code-group
<<< ./snippets/documents/aliases-delete.ts#example{ts} [JavaScript]
<<< ./snippets/documents/aliases-delete.swift#example{swift} [Swift]
:::

## aliases.listForDocument(documentId)

List all aliases pointing at a document.

::: code-group
<<< ./snippets/documents/aliases-list-for-document.ts#example{ts} [JavaScript]
<<< ./snippets/documents/aliases-list-for-document.swift#example{swift} [Swift]
:::
