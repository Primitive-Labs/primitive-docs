# Swift ↔ JS dev-docs divergence catalog

Every divergence note flagged in the [dev-docs cookbook](dev-docs/) — **all of them, including intentional ones**. Auto-extracted from the `:::` callouts. 46 notes across 13 surfaces.

**Flag:** 🔴 unintentional gap / missing-in-Swift · 🟡 intentional (deferred / skipped / by-design / Swift-only) · 🟢 divergent shape (same capability, different shape) · 🔵 info.

**Totals:** 🔴 10 · 🟡 9 · 🟢 27 · 🔵 0


## analytics

| Section | Flag | Divergence |
|---|---|---|
| [logEvent(event)](dev-docs/analytics.md#logeventevent) | 🟢 | **Divergent shape** — JS takes an inline typed object (`client.analytics.logEvent({ action, … })`); Swift takes a typed `AnalyticsEventInput` struct with the same snake_case fields (`client.analytics.logEvent(AnalyticsE… |

## auth

| Section | Flag | Divergence |
|---|---|---|
| [(page intro)](dev-docs/auth.md) | 🟢 | **Typed `client.auth` namespace (Swift)** — The non-native auth surface — magic-link, OTP, `getAuthConfig`, `getAppConfig`, `logout`, the offline-grant suite, and the identity/token accessors (`getUserId`/`getToken`/`isAuthenticated`/`waitFo… |
| [startOAuthFlow(continueUrl?, options?)](dev-docs/auth.md#startoauthflowcontinueurl-options) | 🟢 | **Divergent shape** — JS redirects the page in place and returns `void`, accepting `{ waitlist, inviteToken }`. |
| [exchangeOAuthCode(params) *(static)*](dev-docs/auth.md#exchangeoauthcodeparams-static) | 🟢 | **Divergent shape** — JS takes a single params object (with optional `refreshProxyBaseUrl`/`refreshProxyCookieMaxAgeSeconds`); Swift takes named arguments and has no refresh-proxy options (#964). |
| [magicLinkRequest(email, options?)](dev-docs/auth.md#magiclinkrequestemail-options) | 🟢 | **Divergent shape** — Both clients return a typed `{ success }` result (Swift `MagicLinkRequestResult`). |
| [magicLinkVerify(token, options?)](dev-docs/auth.md#magiclinkverifytoken-options) | 🟢 | **Divergent shape** — Both clients return a typed result with `{ user, isNewUser?, promptAddPasskey? }` (Swift `MagicLinkVerifyResult` via `client.auth.magicLinkVerify`). |
| [otpRequest(email)](dev-docs/auth.md#otprequestemail) | 🟢 | **Divergent shape** — Both clients return a typed `{ success }` result (Swift `OtpRequestResult` via `client.auth.otpRequest`); JS keeps it top-level on `client.*` (#964). |
| [otpVerify(email, code, options?)](dev-docs/auth.md#otpverifyemail-code-options) | 🟢 | **Divergent shape** — Both clients return a typed result with `{ user, isNewUser? }` (Swift `OtpVerifyResult` via `client.auth.otpVerify`). |
| [Passkeys](dev-docs/auth.md#passkeys) | 🟡 | **No Swift equivalent (by design)** — The `passkey*` methods are **JavaScript-only on purpose**. |
| [logout(options?)](dev-docs/auth.md#logoutoptions) | 🔴 | **Swift parity gap** — Swift's `logout` **skips the server `/auth/logout` POST** that clears the auth cookie — it only tears down local state — so the session cookie can linger server-side. |

## blob-buckets

| Section | Flag | Divergence |
|---|---|---|
| [download(bucketIdOrKey, blobId)](dev-docs/blob-buckets.md#downloadbucketidorkey-blobid) | 🟢 | **Divergent shape** — Swift hands back a `Data` value where JS resolves to an `ArrayBuffer` — the idiomatic raw-bytes type on each platform (Swift has no `ArrayBuffer`; JS has no `Data`). |

## cache

| Section | Flag | Divergence |
|---|---|---|
| [info(key)](dev-docs/cache.md#infokey) | 🟢 | **Divergent shape** — JS returns an object `{ updatedAt?, ageMs? }` (`{}` on a miss); Swift returns a tuple `(updatedAt: String?, ageMs: Double?)` (always present, `nil` members on a miss). |

## codegen

| Section | Flag | Divergence |
|---|---|---|
| [Authoring models](dev-docs/codegen.md#authoring-models) | 🟡 | **Filename divergence** — The two clients read the schema from **different filenames**: the JS codegen (`js-bao-codegen-v2`) reads `models.toml`; the Swift codegen (`swift-bao-codegen` / `JsBaoCodegenPlugin`) globs `*schema… |
| [D3 — name derivation {#d3-name-derivation}](dev-docs/codegen.md#d3-name-derivation-d3-name-derivation) | 🟡 | **D3 · Default name derivation differs (but `class_name` reconciles it)** — With **no** `class_name`, the codegens derive **different** default type names: JS singularizes to PascalCase (`[models.tasks]` → `Task`); Swift PascalCases without singularizing and appends a `--n… |
| [D4 — `--check` strict mode {#d4-check-strict}](dev-docs/codegen.md#d4---check-strict-mode-d4-check-strict) | 🟢 | **D4 · Strict unknown-key rejection is still JS-only** — `--check` reaches parity, but the other CI behavior — strict unknown-key rejection (`js-bao-codegen-v2` default-on, with a `--no-strict` escape hatch) — has no Swift equivalent yet. |
| [D6 — registration barrel {#d6-registration}](dev-docs/codegen.md#d6-registration-barrel-d6-registration) | 🟢 | **D6 · One residual difference** — JS's barrel also fail-loud-checks that the TOML model set and the generated class set match on import. |

## databases

| Section | Flag | Divergence |
|---|---|---|
| [connect(databaseId)](dev-docs/databases.md#connectdatabaseid) | 🟢 | **Divergent shape** — Now on both clients (#1019). |

## document-blob

| Section | Flag | Divergence |
|---|---|---|
| [upload(source, options?)](dev-docs/document-blob.md#uploadsource-options) | 🟢 | **Source type differs by platform** — Swift's `upload(data:options:)` now supports the `retainLocal` option (defaults to `true`, matching JS). |
| [read(blobId, options?)](dev-docs/document-blob.md#readblobid-options) | 🟢 | **Divergent shape** — JS's `read` takes an `options` object (`as: "uint8array" \| "arrayBuffer" \| "blob" \| "text"`) and returns the requested format. |
| [proxyUrl(blobId, options?)](dev-docs/document-blob.md#proxyurlblobid-options) | 🔴 | **No Swift equivalent** — JavaScript-only — relies on a browser service worker, which has no Swift counterpart (web-only by platform constraint). |
| [hasServiceWorkerControl()](dev-docs/document-blob.md#hasserviceworkercontrol) | 🔴 | **No Swift equivalent** — JavaScript-only — service-worker-specific (web-only by platform constraint). |

## documents

| Section | Flag | Divergence |
|---|---|---|
| [list(options?)](dev-docs/documents.md#listoptions) | 🟡 | **Deprecated** — Prefer `client.me.ownedDocuments()` / `client.me.sharedDocuments()` (#628). |
| [getDocumentPermission(documentId)](dev-docs/documents.md#getdocumentpermissiondocumentid) | 🟢 | **Equivalent shapes** — JS returns a string literal union (or `null`); Swift returns a typed `DocumentPermission?` enum whose raw values are exactly those strings (`"owner"`, `"read-write"`, `"reader"`, `"admin"`). |
| [setAwareness(documentId, state)](dev-docs/documents.md#setawarenessdocumentid-state) | 🟡 | **No Swift equivalent (deferred)** — JavaScript-only — the awareness/presence subsystem (cursors/selections over the WebSocket) is not in the Swift v1 surface. |
| [getAwarenessStates(documentId)](dev-docs/documents.md#getawarenessstatesdocumentid) | 🟡 | **No Swift equivalent (deferred)** — JavaScript-only — the awareness/presence subsystem (cursors/selections over the WebSocket) is not in the Swift v1 surface. |
| [removeAwareness(documentId, clientIds, reason?)](dev-docs/documents.md#removeawarenessdocumentid-clientids-reason) | 🟡 | **No Swift equivalent (deferred)** — JavaScript-only — the awareness/presence subsystem (cursors/selections over the WebSocket) is not in the Swift v1 surface. |
| [createInvitation(documentId, email, permission, options?)](dev-docs/documents.md#createinvitationdocumentid-email-permission-options) | 🔴 | **Deprecated** — Prefer `updatePermissions` with `{ email, permission }`. |
| [listInvitations(documentId)](dev-docs/documents.md#listinvitationsdocumentid) | 🔴 | **Deprecated** — Prefer `listPendingInvitations` (#619). |
| [getInvitation(documentId, email)](dev-docs/documents.md#getinvitationdocumentid-email) | 🔴 | **Deprecated** — Prefer `client.invitations.get(invitationId)` or `listPendingInvitations` (#619). |
| [updateInvitation(documentId, email, permission, options?)](dev-docs/documents.md#updateinvitationdocumentid-email-permission-options) | 🔴 | **Deprecated** — Prefer `updatePermissions` — it is idempotent (#619). |
| [deleteInvitation(documentId, invitationId)](dev-docs/documents.md#deleteinvitationdocumentid-invitationid) | 🔴 | **Deprecated** — Prefer `removePermission` with `{ email }`, or `client.invitations.delete(invitationId)` (#619). |
| [acceptInvitation(documentId)](dev-docs/documents.md#acceptinvitationdocumentid) | 🔴 | **Deprecated** — The per-document accept concept was removed — shares to existing users take effect immediately (#619). |
| [declineInvitation(documentId, invitationId)](dev-docs/documents.md#declineinvitationdocumentid-invitationid) | 🔴 | **Deprecated** — No invitee-side decline verb — pending invitations expire automatically. |

## errors

| Section | Flag | Divergence |
|---|---|---|
| [Catching an error](dev-docs/errors.md#catching-an-error) | 🟢 | **Divergent shape** — `isJsBaoError` is a structural duck-type in JS — it returns `true` for any object with a string `code`, including errors revived from JSON. |
| [Matching a specific code](dev-docs/errors.md#matching-a-specific-code) | 🟢 | **Divergent shape** — JS compares `code` against the wire string (`e.code === "NOT_FOUND"`); Swift matches the `JsBaoErrorCode` enum case (`err.code == .notFound`). |
| [Reading error details](dev-docs/errors.md#reading-error-details) | 🟢 | **Divergent shape** — Swift drops the JS `name` field on the error object — use the typed `catch`/`is JsBaoError` check rather than a `name` discriminator (sweep errors D2). |

## events

| Section | Flag | Divergence |
|---|---|---|
| [permission](dev-docs/events.md#permission) | 🟢 | **Divergent shape** — `permission` is a plain string in JS (`payload.permission`) but a typed enum in Swift — read its `.rawValue` to get the wire string (`event.permission.rawValue`). |
| [syncPerf](dev-docs/events.md#syncperf) | 🟡 | **Partial** — Swift's `SyncPerfEvent` carries `timings`/`clientTimings` for decode parity, but the Swift client doesn't yet instrument the per-phase timing maps (it only computes `phase`/`elapsedMs`), so those m… |
| [awareness](dev-docs/events.md#awareness) | 🟢 | **Divergent shape** — JS delivers **deltas** — `added` / `updated` / `removed` arrays of client IDs. |

## groups

| Section | Flag | Divergence |
|---|---|---|
| [addMember(groupType, groupId, params)](dev-docs/groups.md#addmembergrouptype-groupid-params) | 🟢 | **Mutual exclusivity** — JS enforces the userId-XOR-email contract at compile time via a union type. |
| [removeMemberByEmail(groupType, groupId, email)](dev-docs/groups.md#removememberbyemailgrouptype-groupid-email) | 🟡 | **Swift-only** — Swift splits the email removal path into its own method. |

## model-surface

| Section | Flag | Divergence |
|---|---|---|
| [(page intro)](dev-docs/model-surface.md) | 🟢 | **Why the JS and Swift model APIs look a little different** — Same verbs, and **both run queries through an embedded SQLite engine**. They differ in style only: JS's SQLite is WASM/IndexedDB-backed and reached asynchronously (`await`ed reads); Swift mirrors records into a native in-memory SQLite read synchronously. |
| [save(options?)](dev-docs/model-surface.md#saveoptions) | 🟢 | **Swift makes you name the document** — JS keeps a hidden "active document" pointer and `save()` writes to it; Swift has no hidden active doc, so you always say which one with `save(in:)`. Same write, explicit target. |
| [query(filter?, options?)](dev-docs/model-surface.md#queryfilter-options) | 🟢 | **Two methods vs one** — JS folds paging into one `query` that always returns `PaginatedResult<Task>`; Swift splits it — `query()` returns plain `[Task]`, `queryPaged()` returns the cursor page. Same capability, two entry points. |
| [aggregate(options)](dev-docs/model-surface.md#aggregateoptions) | 🟢 | **Same grouping, flat rows vs nested map** — Both run SQL `GROUP BY` with the same shapes (fields, stringset facet, stringset membership via `AggregateGroupBy`); the only difference is the container — JS returns a nested map, Swift returns flat `[[String: Any]]` rows ([#1068](https://github.com/Primitive-Labs/js-bao-wss/issues/1068)). |

## workflows

| Section | Flag | Divergence |
|---|---|---|
| [listRuns(options?)](dev-docs/workflows.md#listrunsoptions) | 🟢 | **Divergent shape** — JS passes the filters as a flat inline object (`listRuns({ workflowKey, status, limit })`); Swift wraps them in a named `ListWorkflowRunsOptions` struct passed as `options:`. |
