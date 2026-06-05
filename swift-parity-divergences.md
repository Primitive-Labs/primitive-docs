# Swift ↔ JS dev-docs divergence catalog

Every divergence note flagged in the [dev-docs cookbook](dev-docs/) — **all of them, including intentional ones**. Auto-extracted from the `:::` callouts. 56 notes across 14 surfaces.

**Flag:** 🔴 unintentional gap / missing-in-Swift · 🟡 intentional (deferred / skipped / by-design / Swift-only) · 🟢 divergent shape (same capability, different shape) · 🔵 info.

**Totals:** 🔴 12 · 🟡 9 · 🟢 35 · 🔵 0


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
| [uploads()](dev-docs/document-blob.md#uploads) | 🟢 | **App-wide variants** — The same upload-queue verbs (`uploads`, `pauseUpload`, `resumeUpload`, `pauseAllUploads`, `resumeAllUploads`, `setUploadConcurrency`) also live on `client.documents` with an optional `documentId:`… |

## documents

| Section | Flag | Divergence |
|---|---|---|
| [list(options?)](dev-docs/documents.md#listoptions) | 🟡 | **Deprecated** — Prefer `client.me.ownedDocuments()` / `client.me.sharedDocuments()` (#628). |
| [removePermission(documentId, target)](dev-docs/documents.md#removepermissiondocumentid-target) | 🟢 | **Divergent shape** — JS takes a `string \| { userId } \| { email }` union; Swift splits it into `userId:` / `email:` overloads. |
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

## me

| Section | Flag | Divergence |
|---|---|---|
| [cacheInfo()](dev-docs/me.md#cacheinfo) | 🟢 | **Divergent shape** — JS returns `{ updatedAt?, ageMs? }`; Swift returns the typed tuple `(updatedAt: String?, ageMs: Double?)`. |

## model-surface

| Section | Flag | Divergence |
|---|---|---|
| [(page intro)](dev-docs/model-surface.md) | 🟢 | **Divergent shape** — Both clients now expose the surface as one model per type. |
| [save(options?)](dev-docs/model-surface.md#saveoptions) | 🟢 | **Divergent shape** — JS targets the active document by default (or `{ targetDocument }`); Swift's `save(in:)` always names the document explicitly — there's no active-document defaulting. |
| [find(id)](dev-docs/model-surface.md#findid) | 🟢 | **Divergent shape** — JS `Task.find` is `async` (returns a `Promise`); Swift `Task.find(_:)` is synchronous (reads from the local cross-document store, no `await`/`throws`). |
| [findAll()](dev-docs/model-surface.md#findall) | 🟢 | **Divergent shape** — JS `Task.findAll()` is `async`; Swift `Task.findAll()` is synchronous (local cross-document read). |
| [query(filter?, options?)](dev-docs/model-surface.md#queryfilter-options) | 🟢 | **Divergent shape** — JS returns a `PaginatedResult<Task>` — rows on `.data`, plus `.nextCursor` / `.hasMore`. |
| [query — paginate](dev-docs/model-surface.md#query-paginate) | 🔴 | **Swift parity gap** — JS carries `PaginatedResult.nextCursor` forward via `uniqueStartKey` on the same `query()`. |
| [count(filter?)](dev-docs/model-surface.md#countfilter) | 🟢 | **Divergent shape** — JS `Task.count` is `async`; Swift `Task.count` is a synchronous static returning an `Int`, counting across every open document. |
| [aggregate(options)](dev-docs/model-surface.md#aggregateoptions) | 🔴 | **Swift parity gap** — Swift `Task.aggregate` is a static returning untyped `[[String: Any]]` rows (vs JS's typed result). |
| [subscribe(callback)](dev-docs/model-surface.md#subscribecallback) | 🟢 | **Divergent shape** — Both clients expose `Task.subscribe`. |
| [update](dev-docs/model-surface.md#update) | 🟢 | **Divergent shape** — Both clients now update the same way: load the record, mutate fields on the value, then persist. |
| [delete()](dev-docs/model-surface.md#delete) | 🟢 | **Divergent shape** — Both clients load the record and call `delete` on the instance. |

## workflows

| Section | Flag | Divergence |
|---|---|---|
| [listRuns(options?)](dev-docs/workflows.md#listrunsoptions) | 🟢 | **Divergent shape** — JS passes the filters as a flat inline object (`listRuns({ workflowKey, status, limit })`); Swift wraps them in a named `ListWorkflowRunsOptions` struct passed as `options:`. |
