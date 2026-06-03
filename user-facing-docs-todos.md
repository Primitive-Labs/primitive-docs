# Swift `documents` API: untyped → typed — change record & docs follow-ups

**Status:** dev-docs cookbook done & compiling; user-facing `docs/` + `guides/latest/` NOT yet updated (tracked below).
**Branches:** client fix on `js-parity-jun-3` (in the `js-bao-wss` clone, off PR #923); docs on `docs-parity-jun-3` (off `swift-integration`).
**Resolves:** [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954) (Swift `DocumentsAPI` untyped `[String: Any]`), plus the `modifiedAt`/`lastModified` naming drift ([#673](https://github.com/Primitive-Labs/js-bao-wss/issues/673)) and the `{ success }` / typed-result drifts noted in `swift-parity-crosswalk.md`.

---

## 1. What changed in `js-bao-wss` (the Swift client)

The Swift `DocumentsAPI` (and `DocumentAliasesAPI`) previously took and returned untyped `[String: Any]` / `[[String: Any]]` everywhere. It now takes and returns the same named types the JS client publishes (`DocumentInfo`, `PermissionUpdateResult`, `DocumentAccessRequest`, `DocumentAliasInfo`, …), decoded from the wire.

### New files (swift-client)
- `Sources/JsBaoClient/Types/JSONValue.swift` — the typed-decode foundation:
  - `JSONValue` — a type-erased, `Codable` JSON value for opaque/round-tripped fields (a document's `metadata`). Mirrors JS `unknown`. Has `ExpressibleBy*Literal` conformances, so callers write `metadata: ["color": "blue"]`.
  - `Updatable<T>` — a tri-state (`.value(x)` / `.clear` / omit) for nullable replace-semantics fields where a plain `String?` can't express "set to null" (e.g. `thumbnailBlobId`).
  - `JSONCoding` — `decode<T>(_:from:)` / `jsonObject(from:)` bridging `makeRequest`'s `Any` graph to/from typed `Codable` models.
- `Sources/JsBaoClient/Types/DocumentTypes.swift` — all typed request/response models (see table).

### Reconciled in `Sources/JsBaoClient/Types/Options.swift`
- `CreateDocumentOptions` — kept here (shared with `JsBaoClient.createDocument`); gained `metadata: JSONValue?` + `Encodable`.
- `DocumentInfo` — the old partial struct (`modifiedAt`, `permission: String?`, `tenantScopedDO`) was removed; the parity-shaped `DocumentInfo` now lives in `DocumentTypes.swift` (decodes the wire's `modifiedAt` into `lastModified` so the property matches JS).

### Signature map (old → new)

| Method | Old | New |
| --- | --- | --- |
| `create` | `(options: [String:Any]?) -> [String:Any]` | `(options: CreateDocumentOptions = .init()) -> CreateDocumentResult` |
| `list` | `… -> [String:Any]` | `… -> [DocumentInfo]` |
| `get` | `-> [String:Any]` | `-> DocumentInfo` |
| `update` | `(data: [String:Any]) -> [String:Any]` | `(data: UpdateDocumentData) -> DocumentInfo` |
| `delete` | `(forceCloseIfOpen: Bool=false) -> [String:Any]` | `(options: DeleteDocumentOptions = .init()) -> Void` |
| `getPermissions` | `-> [[String:Any]]` | `-> [DocumentPermissionEntry]` |
| `updatePermissions` | `(params: [String:Any]) -> [String:Any]` | `(params: UpdatePermissionsData) -> PermissionUpdateResult` |
| `removePermission(userId:)` / `(email:)` | `-> [String:Any]` | `-> Void` |
| `transferOwnership` | `-> [String:Any]` | `-> Void` |
| `listGroupPermissions` | `-> [[String:Any]]` | `-> [DocumentGroupPermissionEntry]` |
| `grantGroupPermission` | `(params: [String:Any]) -> [String:Any]` | `(params: GrantGroupPermissionParams) -> DocumentGroupPermissionEntry` |
| `revokeGroupPermission` | `-> [String:Any]` | `-> SuccessResult` |
| `validateAccess` | `-> [String:Any]` | `-> DocumentAccessResult` |
| `requestAccess` | `(params: [String:Any]) -> [String:Any]` | `(options: RequestAccessOptions) -> DocumentAccessRequestResponse` |
| `listAccessRequests` | `-> [[String:Any]]` | `-> [DocumentAccessRequest]` |
| `approveAccessRequest` | `(params: [String:Any]?) -> [String:Any]` | `(options: ApproveAccessRequestOptions?) -> AccessRequestResult` |
| `denyAccessRequest` | `(params: [String:Any]?) -> [String:Any]` | `(options: DenyAccessRequestOptions?) -> AccessRequestResult` |
| `listPendingInvitations` | `-> [[String:Any]]` | `-> [PendingInvitationEntry]` |
| `getRoot` | `-> [String:Any]` | `-> DocumentInfo` |
| `createWithAlias` | `(options: [String:Any]) -> [String:Any]` | `(options: CreateWithAliasOptions) -> CreateWithAliasResult` |
| `getOrCreateWithAlias` | `(alias: [String:Any], title:, tags:) -> [String:Any]` | `(options: GetOrCreateWithAliasOptions) -> GetOrCreateWithAliasResult` |
| `aliases.set` | `(scope: String, aliasKey:, documentId:, …) -> [String:Any]` | `(_ params: SetAliasParams) -> DocumentAliasInfo` |
| `aliases.resolve` | `(scope: String, aliasKey:, …) -> [String:Any]?` | `(_ params: AliasRef) -> DocumentAliasInfo?` |
| `aliases.delete` | `(scope: String, aliasKey:, …) -> Void` | `(_ params: AliasRef) -> Void` |
| `aliases.listForDocument` | `-> [[String:Any]]` | `-> [DocumentAliasInfo]` |
| deprecated `sendInvitation` / `getInvitation` / `updateInvitation` / `deleteInvitation` / `declineInvitation` / `listInvitations` / `acceptInvitation` | `… [String:Any] …` | `DocumentInvitationResponse` / `DocumentInvitation?` / `DocumentInvitationResponse` / `MessageResult` / `MessageResult` / `[DocumentInvitation]` / `DocumentAccessResult` |

**Unchanged** (already typed / primitive, no migration): `addTag`/`removeTag` (`[String]`), `getOwner` (`String?`), all local-only predicates (`isOpen`, `isPendingCreate`, `hasLocalCopy`, `listPendingCreates`, `cancelPendingCreate`, `getDocumentPermission`, `getLocalMetadata`, `inSync`, `includesWrites`, `waitFor*`, `evict`, `evictAll`), `open`/`openRoot`/`close`. The per-document **blob** context (`documents.blobs(id)`) is intentionally still `[String: Any]` — separate surface, out of scope here.

### Behavioral note worth surfacing in docs
`create` returns **only** `{ metadata }` (mirrors JS `Promise<{ metadata }>`) — **not** the document id. The current human example `documents/create-document.swift` reads `result["metadata"]?["documentId"]`, which the typed shape makes impossible (and which was never a reliable field on `create`). The typed migration should use `createWithAlias` (returns `documentId`) when the id is needed.

---

## 2. Done on `docs-parity-jun-3` (dev-docs cookbook)

- All 32 affected Swift snippets under `dev-docs/snippets/documents/` rewritten to the typed API (the other 19 local-only/tag snippets were already typed).
- `dev-docs/documents.md` callouts corrected: the blanket "untyped `[String: Any]`" tip is now a "Typed surface" note; the `get`, `revokeGroupPermission`, and `aliases.set` divergence tips (now resolved) removed/rewritten; the `list`/`delete`/`removePermission` tips trimmed to the remaining *behavioral* divergences.
- `node scripts/compile-dev-examples.mjs` → **green** (TS + Swift).

> The dev gate compiles green only because the typed client is mirrored into the submodule working tree (`library_repos/js-bao-wss/swift-client`). That same mirror breaks the main corpus (next section). The mirror is a local verification artifact — it is not committed as a submodule pin move.

---

## 3. TODO — user-facing `docs/` + `guides/latest/`

These compile against the **same** vendored submodule, so once the typed client lands they MUST be updated. **12 Swift example files** currently break (verified via `node scripts/compile-examples.mjs` against the mirrored client):

| Example file (`examples/…`) | What to change |
| --- | --- |
| `documents/create-document.swift` | `create(options:)` dict → `CreateDocumentOptions`; `result["metadata"]…["documentId"]` is gone — switch to `createWithAlias` if the id is needed (see behavioral note) |
| `documents/update-metadata.swift` | `update(data:)` dict → `UpdateDocumentData(title:, thumbnailBlobId: .value(blobId), metadata: …)` |
| `documents/delete-document.swift` | `delete(forceCloseIfOpen:)` → `delete(options: DeleteDocumentOptions(forceCloseIfOpen: true))`; returns `Void` |
| `documents/get-or-create-doc.swift` | `getOrCreateWithAlias(alias:title:tags:)` → `getOrCreateWithAlias(options: GetOrCreateWithAliasOptions(alias: AliasRef(scope:.user, aliasKey:), title:, tags:))` |
| `documents/share-document.swift` | `updatePermissions(params:)` dict ×N → `.email(...)`/`.user(...)`; `grantGroupPermission(params:)` dict → `GrantGroupPermissionParams` |
| `data-modeling/per-user-document.swift` | `getOrCreateWithAlias` old args → `options:` |
| `data-modeling/workspace-document.swift` | `create` dict → `CreateDocumentOptions`; `updatePermissions(params:)` dict → typed |
| `sharing/request-access.swift` | label `params:` → `options:`; dict → `RequestAccessOptions(permission: .readWrite, message:)` |
| `sharing/share-batch.swift` | `updatePermissions(params:)` batch dict → `.batch([PermissionAssignment(...)])` |
| `sharing/worked-example.swift` | `updatePermissions(params:)` dict → `.email(...)` |
| `sharing/deny-access-request.swift` | extra `params:` arg → `options: DenyAccessRequestOptions(...)` (or drop) |
| `users-and-groups/grant-group-document.swift` | `grantGroupPermission(params:)` dict → `GrantGroupPermissionParams` |

Compile-clean (typed returns, no subscript) and need no change: `sharing/document-members.swift`, `sharing/pending-invitations.swift`, `sharing/remove-doc-access.swift`.

**`docs/` pages that embed the above** (prose may also mention dict shapes): `docs/getting-started/working-with-documents.md`, `docs/getting-started/sharing-and-invitations.md`, `docs/getting-started/users-and-groups.md`.

**Guide Sync Rule** — the matching `guides/latest/*.swift.md` must stay in sync: `AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.swift.md`, `…_SHARING_AND_INVITATIONS.swift.md`, `…_USERS_AND_GROUPS.swift.md`, `…_DATA_MODELING.swift.md` (regenerate from the `.template.md` + updated corpus, or hand-edit the Swift blocks).

---

## 4. Landing checklist (to make this real, beyond local verification)

1. **Client tests** — ~10 files in `js-bao-wss/swift-client/Tests/JsBaoClientTests/` call the old untyped signatures (`DocumentPermissionsTests`, `InvitationTests`, `DocMetadataWSTests`, `ApiParityRound2Tests`, `RootDocTests`, `AppCleanupTests`, `InviteOnlyTests`, `InvitationWSTests`, `BlobTests`, `JsBaoClientTests`). `swift build` (library only) passes; `swift test` will not until these are updated.
2. **Commit + push** `js-parity-jun-3` typed changes to origin.
3. **Re-pin the submodule** (`library_repos/js-bao-wss`) to that commit (currently pinned `4f4e406`, pre-#923).
4. **Then** update the `docs/` examples + `guides/` per §3 and run `compile:examples` + `compile:dev-examples` green.

## 5. Behavioral parity pass (follow-up — "fix simple, defer big")

After typing, the remaining documents divergences were triaged. **Implemented** (simple alignments the document-manager already backed):
- `delete` → evicts local data + emits `documentMetadataChanged(action:"deleted")` + treats `404`/offline as already-applied (offline-fallback) (#961).
- `removePermission(userId:)` → evicts local data on self-removal (#961).
- `close` → returns `CloseDocumentResult { evicted }`, with a sync-state guard so eviction is skipped (and `evicted:false`) when local writes are unsynced (#961).
- `listGroupPermissions(includeSystem:)` → default excludes `_`-prefixed platform groups (#506).
- Added the four "JS-only" methods Swift can now back: `openAlias`, `isReadOnly`, `listOpen`, `isSynced`.

**Kept divergent — with justification** (documented inline in `dev-docs/documents.md` and `PARITY-TRACKING.md` #961):
- `inSync` / `includesWrites` — **by design** sync-local predicates; async network behavior is `waitForInSync` / `waitForWriteConfirmation`.
- `getDocumentPermission` (typed enum) and `getLocalMetadata` (sync, SQLite vs IndexedDB) — platform/idiom wins, not gaps.
- `open` returns `YDocument` (not `{doc, metadata}`) — ergonomic Swift shape.

**Deferred big transformations — with justification:**
- Local-first `documents.create` + `commitOfflineCreate` (#852) — the flow exists via `client.createDocument`; routing the sub-API through it is larger.
- `list` pagination options (#946) — `list` is deprecated; option-parity belongs on `me.ownedDocuments`/`sharedDocuments`.
- Awareness/presence API — a standalone WS subsystem, not in v1.

## 6. How to verify what's done now
- Client library: `cd js-bao-wss/swift-client && swift build` → Build complete.
- Dev cookbook: `cd primitive-docs && node scripts/compile-dev-examples.mjs` → All dev snippets compile (requires the mirrored submodule).

## 7. Parity waves — additional typed surfaces (beyond documents)

Per-sub-api agents are typing the rest of the client (#954) + fixing their tracker rows. Each wave: client typed → cookbook updated → user-facing follow-ups recorded here.

### Wave 1 (done) — session, users, gemini, llm, database/collection/group-type-configs
Client typed + cookbook updated; clone builds and the dev gate is green. **No *required* user-facing `docs/` changes** — none of these surfaces have untyped Swift snippets in `docs/getting-started/` or `guides/latest/` (their untyped examples lived only in the cookbook, now typed). Optional editorial only:
- `guides/latest/AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.swift.md` — `users` call sites already compile against the typed API; an editorial pass could show typed field access (`user.name`, `result.exists`, `profiles.map { $0.name }`) and name the `GetUserOptions` / `BasicUserInfo` / `UserLookupResult` types. The `groupTypeConfigs`/`collectionTypeConfigs` mentions there are prose/TOML only.
- If a Swift tab is ever added for `users.lookup` in `docs/getting-started/sharing-and-invitations.md` / `users-and-groups.md`, use the typed `UserLookupResult`.

Also landed (bounded behavioral fixes, separate from typing): `JsBaoErrorCode.workflowApplyNotConfirmed` ([#959](https://github.com/Primitive-Labs/js-bao-wss/issues/959)), `groups.listUserMemberships(groupType:)` ([#960](https://github.com/Primitive-Labs/js-bao-wss/issues/960)), `databases.list(databaseType:)` ([#962](https://github.com/Primitive-Labs/js-bao-wss/issues/962)), `collectionTypeConfigs`/`groupTypeConfigs` path-encoding ([#596](https://github.com/Primitive-Labs/js-bao-wss/issues/596)/[#590](https://github.com/Primitive-Labs/js-bao-wss/issues/590)).
