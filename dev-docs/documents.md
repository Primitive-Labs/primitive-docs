# documents — `client.documents`

Create, open, share, and sync collaborative Yjs documents. Blob attachments are a separate surface ([`client.documents.blobs(id)`](/blobs)) and are not covered here.

::: tip Typed surface
The Swift `DocumentsAPI` now takes and returns the same named types JS exposes — `DocumentInfo`, `PermissionUpdateResult`, `DocumentAccessRequest`, `DocumentAliasInfo`, and friends — decoded from the wire by the client (resolving [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)). Opaque blobs such as a document's `metadata` are typed as `JSONValue`, which is `Codable` and accepts dictionary/array/scalar literals (e.g. `metadata: ["color": "blue"]`). Remaining divergences are behavioral — sync vs async, `void` vs a richer result, local-eviction differences — and are noted inline.
:::

## create(options)

Create a new document. Pass `localOnly: true` to defer the server commit.

::: warning Swift parity gap
JS `create` is local-first: it writes the document locally and returns immediately, then commits to the server in the background (and honors `localOnly` to defer the commit entirely). Swift instead POSTs the raw create synchronously and has no offline/deferred path — so a create issued while offline fails rather than queueing (sweep D2, [#852](https://github.com/Primitive-Labs/js-bao-wss/issues/852)).
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

::: tip Divergent shape
Swift returns a typed `[DocumentInfo]` but only supports `limit`/`cursor` pagination. JS adds `tag`, `forward`, `waitForLoad`, `refreshFromServer`, `localOnly`, and a `returnPage` array-vs-page duality ([#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946)).
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

::: warning Swift parity gap
Both clients return `void`, but Swift skips the post-delete reconciliation JS performs: JS evicts the document's local data, emits a `documentMetadataChanged` event, and — when offline — treats a pending/`404` server response as an already-applied delete (offline-fallback) instead of throwing. Swift does none of this, so a deleted doc can linger in local caches and listeners never fire (sweep D4, [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961)).
:::

::: code-group
<<< ./snippets/documents/delete.ts#example{ts} [JavaScript]
<<< ./snippets/documents/delete.swift#example{swift} [Swift]
:::

## open(documentId, options?)

Open a document for editing.

::: tip Divergent shape
JS returns `{ doc, metadata }`; Swift returns the `YDocument` directly and takes a typed `OpenDocumentOptions`.
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

::: tip Divergent shape
JS returns `{ evicted }`; Swift returns `Void` ([#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961)).
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

::: warning No Swift equivalent
JavaScript-only. In Swift, resolve via `documents.aliases.resolve(...)` then `documents.open(...)` ([#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954)).
:::

<<< ./snippets/documents/open-alias.ts#example{ts} [JavaScript]

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

::: warning Swift parity gap
When you remove *your own* permission (leaving a shared doc), JS evicts that document's local data as part of the call; Swift skips this self-removal eviction, so the doc you no longer have access to stays cached on-device (sweep D5, [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961)).
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

List group-based permissions on a document.

::: tip Divergent shape
JS accepts `{ includeSystem: true }` to surface platform-managed internal groups; Swift has no such option ([#506](https://github.com/Primitive-Labs/js-bao-wss/issues/506)).
:::

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

::: tip Divergent shape
JS is an async state-vector round-trip; Swift is a synchronous local read.
:::

::: code-group
<<< ./snippets/documents/in-sync.ts#example{ts} [JavaScript]
<<< ./snippets/documents/in-sync.swift#example{swift} [Swift]
:::

## includesWrites(documentId, timeoutMs?)

Check whether the server has all of this client's writes.

::: tip Divergent shape
JS is an async state-vector round-trip; Swift is a synchronous local read.
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

Check whether a document's local state is synced (synchronous, local).

::: warning No Swift equivalent
JavaScript-only. On Swift use `inSync(...)` or `waitForInSync(...)` ([api.md exclusion](https://github.com/Primitive-Labs/js-bao-wss/issues/961)).
:::

<<< ./snippets/documents/is-synced.ts#example{ts} [JavaScript]

## isOpen(documentId)

Check whether a document is currently open (synchronous, local).

::: code-group
<<< ./snippets/documents/is-open.ts#example{ts} [JavaScript]
<<< ./snippets/documents/is-open.swift#example{swift} [Swift]
:::

## isReadOnly(documentId)

Check whether a document is read-only for the current user.

::: warning No Swift equivalent
JavaScript-only. On Swift, derive it from `getDocumentPermission(...)` or `getPermissions(...)`.
:::

<<< ./snippets/documents/is-read-only.ts#example{ts} [JavaScript]

## listOpen()

List the IDs of all currently open documents.

::: warning No Swift equivalent
JavaScript-only — Swift tracks open state in its internal `DocumentManager`.
:::

<<< ./snippets/documents/list-open.ts#example{ts} [JavaScript]

## getDocumentPermission(documentId)

Get the current user's permission level for a document (local).

::: tip Divergent shape
JS returns a string literal union (or `null`); Swift returns a typed `DocumentPermission?` enum.
:::

::: code-group
<<< ./snippets/documents/get-document-permission.ts#example{ts} [JavaScript]
<<< ./snippets/documents/get-document-permission.swift#example{swift} [Swift]
:::

## getLocalMetadata(documentId)

Get locally cached metadata for a document.

::: tip Divergent shape
JS is an async accessor; Swift is a synchronous local read.
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

::: warning No Swift equivalent
JavaScript-only — Swift has no `commitOfflineCreate` ([#852](https://github.com/Primitive-Labs/js-bao-wss/issues/852)).
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

::: warning No Swift equivalent
JavaScript-only — the awareness/presence API is not in the Swift v1 surface.
:::

<<< ./snippets/documents/set-awareness.ts#example{ts} [JavaScript]

## getAwarenessStates(documentId)

Get all current awareness states for a document.

::: warning No Swift equivalent
JavaScript-only — the awareness/presence API is not in the Swift v1 surface.
:::

<<< ./snippets/documents/get-awareness-states.ts#example{ts} [JavaScript]

## removeAwareness(documentId, clientIds, reason?)

Remove awareness states for specific clients (e.g. on timeout).

::: warning No Swift equivalent
JavaScript-only — the awareness/presence API is not in the Swift v1 surface.
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
