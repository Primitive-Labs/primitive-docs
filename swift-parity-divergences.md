# Swift ↔ JS dev-docs divergence catalog

Every divergence note flagged in the [dev-docs cookbook](dev-docs/) — **all of them, including intentional ones**. Auto-extracted from the `:::` callouts. 86 notes across 18 surfaces.

**Flag:** 🔴 unintentional gap / missing-in-Swift · 🟡 intentional (deferred / skipped / by-design / Swift-only) · 🟢 divergent shape (same capability, different shape) · 🔵 info.

**Totals:** 🔴 21 · 🟡 11 · 🟢 54 · 🔵 0


## analytics

| Section | Flag | Divergence |
|---|---|---|
| [(page intro)](dev-docs/analytics.md) | 🟡 | **Swift parity gap — per-feature auto-events not yet instrumented** — The engine and **session lifecycle** auto-events are in place on Swift (the queue auto-flushes on connect and on app background/terminate, and emits a `session_end` event with the session `duration… |
| [logEvent(event)](dev-docs/analytics.md#logeventevent) | 🟢 | **Divergent shape** — JS takes an inline typed object (`client.analytics.logEvent({ action, … })`); Swift takes a typed `AnalyticsEventInput` struct with the same snake_case fields (`client.analytics.logEvent(AnalyticsE… |

## auth

| Section | Flag | Divergence |
|---|---|---|
| [(page intro)](dev-docs/auth.md) | 🟢 | **Typed `client.auth` namespace (Swift)** — The non-native auth surface — magic-link, OTP, `getAuthConfig`, `logout`, the offline-grant suite, and the identity/token accessors (`getUserId`/`getToken`/`isAuthenticated`/`waitForUserId`) — now… |
| [startOAuthFlow(continueUrl?, options?)](dev-docs/auth.md#startoauthflowcontinueurl-options) | 🟢 | **Divergent shape** — JS redirects the page in place and returns `void`, accepting `{ waitlist, inviteToken }`. |
| [exchangeOAuthCode(params) *(static)*](dev-docs/auth.md#exchangeoauthcodeparams-static) | 🟢 | **Divergent shape** — JS takes a single params object (with optional `refreshProxyBaseUrl`/`refreshProxyCookieMaxAgeSeconds`); Swift takes named arguments and has no refresh-proxy options (#964). |
| [magicLinkRequest(email, options?)](dev-docs/auth.md#magiclinkrequestemail-options) | 🟢 | **Divergent shape** — Both clients return a typed `{ success }` result (Swift `MagicLinkRequestResult`). |
| [magicLinkVerify(token, options?)](dev-docs/auth.md#magiclinkverifytoken-options) | 🟢 | **Divergent shape** — Both clients return a typed result with `{ user, isNewUser?, promptAddPasskey? }` (Swift `MagicLinkVerifyResult` via `client.auth.magicLinkVerify`). |
| [otpRequest(email)](dev-docs/auth.md#otprequestemail) | 🟢 | **Divergent shape** — Both clients return a typed `{ success }` result (Swift `OtpRequestResult` via `client.auth.otpRequest`); JS keeps it top-level on `client.*` (#964). |
| [otpVerify(email, code, options?)](dev-docs/auth.md#otpverifyemail-code-options) | 🟢 | **Divergent shape** — Both clients return a typed result with `{ user, isNewUser? }` (Swift `OtpVerifyResult` via `client.auth.otpVerify`). |
| [Passkeys](dev-docs/auth.md#passkeys) | 🟡 | **No Swift equivalent (by design)** — The `passkey*` methods are **JavaScript-only on purpose**. |
| [enableOfflineAccess(options?)](dev-docs/auth.md#enableofflineaccessoptions) | 🔴 | **Swift parity gap** — JS's `EnableOfflineAccessOptions` accepts `{ preferBiometric, allowPinFallback, ttlDays, retention, pinProvider }`; Swift exposes only `ttlDays` plus a **Swift-only `requireBiometric` flag** — the… |
| [getAppConfig()](dev-docs/auth.md#getappconfig) | 🔴 | **Swift parity gap** — JS returns a typed `AppConfig` object with 7 named fields; Swift returns the raw `[String: Any]` envelope, so the app-launch config must be read by string key with no typed shape (sweep auth D4, #9… |
| [logout(options?)](dev-docs/auth.md#logoutoptions) | 🔴 | **Swift parity gap** — JS accepts `{ redirectTo, wipeLocal, revokeOffline, clearOfflineIdentity, waitForDisconnect }`; Swift exposes only `wipeLocal:`. |

## blob-buckets

| Section | Flag | Divergence |
|---|---|---|
| [download(bucketIdOrKey, blobId)](dev-docs/blob-buckets.md#downloadbucketidorkey-blobid) | 🟢 | **Divergent shape** — Swift hands back a `Data` value where JS resolves to an `ArrayBuffer` — the idiomatic raw-bytes type on each platform (Swift has no `ArrayBuffer`; JS has no `Data`). |

## cache

| Section | Flag | Divergence |
|---|---|---|
| [key(base, params?)](dev-docs/cache.md#keybase-params) | 🔴 | **Swift parity gap — keys are not portable** — The two clients produce **different keys** for the same inputs: JS serializes params as `base:<stable-JSON>` and accepts any value (scalar, array, object), while Swift accepts only `[String: Any]`… |
| [info(key)](dev-docs/cache.md#infokey) | 🟢 | **Divergent shape** — JS returns an object `{ updatedAt?, ageMs? }` (`{}` on a miss); Swift returns a tuple `(updatedAt: String?, ageMs: Double?)` (always present, `nil` members on a miss). |
| [KvCache.get / KvCache.set](dev-docs/cache.md#kvcacheget-kvcacheset) | 🟡 | **No JavaScript equivalent** — Swift-only — neither the JS `CacheFacade` nor the JS `KvCache` exposes `get`/`set`. |

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
| [list(options?)](dev-docs/documents.md#listoptions) | 🟡 | **SKIPPED — deprecated** — Swift returns a typed `[DocumentInfo]` but only supports `limit`/`cursor` pagination; JS adds `tag`, `forward`, `waitForLoad`, `refreshFromServer`, `localOnly`, and a `returnPage` array-vs-page dua… |
| [open(documentId, options?)](dev-docs/documents.md#opendocumentid-options) | 🟢 | **Divergent shape (kept by design)** — JS returns `{ doc, metadata }`; Swift returns the `YDocument` directly and takes a typed `OpenDocumentOptions`. |
| [openAlias(params, options?)](dev-docs/documents.md#openaliasparams-options) | 🟢 | **Divergent shape** — JS returns `{ doc, metadata }`; Swift returns the `YDocument` directly (consistent with `open`). |
| [removePermission(documentId, target)](dev-docs/documents.md#removepermissiondocumentid-target) | 🟢 | **Divergent shape** — JS takes a `string \| { userId } \| { email }` union; Swift splits it into `userId:` / `email:` overloads. |
| [getDocumentPermission(documentId)](dev-docs/documents.md#getdocumentpermissiondocumentid) | 🟢 | **Equivalent shapes** — JS returns a string literal union (or `null`); Swift returns a typed `DocumentPermission?` enum whose raw values are exactly those strings (`"owner"`, `"read-write"`, `"reader"`, `"admin"`). |
| [getOwner(documentId)](dev-docs/documents.md#getownerdocumentid) | 🟡 | **Swift-only** — Swift-only convenience. |
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
| [The error code enum](dev-docs/errors.md#the-error-code-enum) | 🟢 | **Divergent shape** — The JS union carries one extra code, `WORKFLOW_APPLY_NOT_CONFIRMED`, that the Swift `JsBaoErrorCode` enum does not yet have (#959). |
| [Catching an error](dev-docs/errors.md#catching-an-error) | 🟢 | **Divergent shape** — `isJsBaoError` is a structural duck-type in JS — it returns `true` for any object with a string `code`, including errors revived from JSON. |
| [Matching a specific code](dev-docs/errors.md#matching-a-specific-code) | 🟢 | **Divergent shape** — JS compares `code` against the wire string (`e.code === "NOT_FOUND"`); Swift matches the `JsBaoErrorCode` enum case (`err.code == .notFound`). |
| [Reading error details](dev-docs/errors.md#reading-error-details) | 🟢 | **Divergent shape** — `details` is typed `any` in JS and carries **heterogeneous structured objects** — numbers (`status`), nested objects (`payload`), and booleans. |

## events

| Section | Flag | Divergence |
|---|---|---|
| [documentMetadataChanged](dev-docs/events.md#documentmetadatachanged) | 🟢 | **Divergent shape** — The `source` vocabulary differs: JS reports `"local" \| "server" \| "idb"`, Swift reports `"local" \| "remote"` (sweep events D6). |
| [permission](dev-docs/events.md#permission) | 🟢 | **Divergent shape** — `permission` is a plain string in JS (`payload.permission`) but a typed enum in Swift — read its `.rawValue` to get the wire string (`event.permission.rawValue`). |
| [blobs:upload-progress](dev-docs/events.md#blobsupload-progress) | 🟢 | **Divergent shape** — JS sends the full queue-item record (12 fields incl. |
| [blobs:upload-completed](dev-docs/events.md#blobsupload-completed) | 🟢 | **Divergent shape** — Swift carries only `documentId`, `blobId`, `numBytes`; JS additionally sends 5 fields — `queueId`, `filename`, `contentType`, `attempts`, `retainLocal`, `updatedAt` (sweep events D3). |
| [blobs:upload-failed](dev-docs/events.md#blobsupload-failed) | 🟢 | **Divergent shape** — JS sends `lastError?` (optional) plus `queueId`/`filename`/`contentType`/`attempts`/`nextAttemptAt`/ `updatedAt`; Swift renames it to a non-optional `error` (optionality flip) and drops the other 6… |
| [workflowStarted](dev-docs/events.md#workflowstarted) | 🟢 | **Divergent shape** — Swift's payload carries only `workflowKey` and `runId` (2 of 7 fields); JS additionally sends `workflowId`, `runKey`, `instanceId`, `contextDocId`, and `meta` (sweep events D1). |
| [syncPerf](dev-docs/events.md#syncperf) | 🟢 | **Divergent shape** — The payloads diverge entirely: JS sends `timings` / `clientTimings` (`Record<string, any>` maps), Swift sends a single `phase` / `elapsedMs` pair (sweep events D5). |
| [awareness](dev-docs/events.md#awareness) | 🟢 | **Divergent shape** — JS delivers **deltas** — `added` / `updated` / `removed` arrays of client IDs. |

## gemini

| Section | Flag | Divergence |
|---|---|---|
| [(page intro)](dev-docs/gemini.md) | 🔴 | **Swift parity gap — no analytics events** — Across **all** `gemini.*` methods, the Swift `GeminiAPI` emits **no analytics events** — JS fires `prompt_started` / `prompt_succeeded` / `prompt_failed` for every generate call, but the Swift auto… |
| [generateRaw(options)](dev-docs/gemini.md#generaterawoptions) | 🟢 | **Divergent error code** — The client-side argument validation throws a **different error code**: Swift throws `INVALID_ARGUMENT`, JS throws `GEMINI_ERROR`. |

## groups

| Section | Flag | Divergence |
|---|---|---|
| [addMember(groupType, groupId, params)](dev-docs/groups.md#addmembergrouptype-groupid-params) | 🟢 | **Mutual exclusivity** — JS enforces the userId-XOR-email contract at compile time via a union type. |
| [removeMemberByEmail(groupType, groupId, email)](dev-docs/groups.md#removememberbyemailgrouptype-groupid-email) | 🟡 | **Swift-only** — Swift splits the email removal path into its own method. |

## integrations

| Section | Flag | Divergence |
|---|---|---|
| [list()](dev-docs/integrations.md#list) | 🔴 | **Swift-only and runtime-broken** — The JS `integrations` surface is `call`-only — it exposes no catalog `list()`. |
| [get(integrationIdOrKey)](dev-docs/integrations.md#getintegrationidorkey) | 🔴 | **Swift-only and runtime-broken** — The JS `integrations` surface is `call`-only — it exposes no catalog `get()`. |

## llm

| Section | Flag | Divergence |
|---|---|---|
| [(page intro)](dev-docs/llm.md) | 🔴 | **Swift parity gap — no analytics events** — Swift `LlmAPI.chat` emits **no analytics events**. |

## me

| Section | Flag | Divergence |
|---|---|---|
| [uploadAvatar(imageData, contentType)](dev-docs/me.md#uploadavatarimagedata-contenttype) | 🟢 | **Minor divergence** — In JS `contentType` is a typed union (`image/png \| image/jpeg \| image/gif \| image/webp`); Swift takes a bare `String`, so an invalid MIME type fails at runtime rather than compile-time. |
| [ownedDocuments(options?)](dev-docs/me.md#owneddocumentsoptions) | 🟢 | **Narrower option set (Swift)** — Swift accepts `cursor`/`limit`/`tag` only — the JS-side `includeRoot`, `refreshFromServer`, `localOnly`, `serverTimeoutMs`, `waitForLoad`, `forward`, and `returnPage` knobs are not surfaced. |
| [cacheInfo()](dev-docs/me.md#cacheinfo) | 🟢 | **Divergent shape** — JS returns `{ updatedAt?, ageMs? }`; Swift returns the typed tuple `(updatedAt: String?, ageMs: Double?)`. |

## model-surface

| Section | Flag | Divergence |
|---|---|---|
| [(page intro)](dev-docs/model-surface.md) | 🟢 | **Divergent shape** — Both clients now expose the surface as one model per type. |
| [save(options?)](dev-docs/model-surface.md#saveoptions) | 🟢 | **Divergent shape** — JS targets the active document by default (or `{ targetDocument }`); Swift's `save(in:)` always names the document explicitly — there's no active-document defaulting. |
| [find(id)](dev-docs/model-surface.md#findid) | 🟢 | **Divergent shape** — JS `Task.find` is `async` (returns a `Promise`); Swift `Task.find(_:)` is synchronous (reads from the local cross-document store, no `await`/`throws`). |
| [findAll()](dev-docs/model-surface.md#findall) | 🟢 | **Divergent shape** — JS `Task.findAll()` is `async`; Swift `Task.findAll()` is synchronous (local cross-document read). |
| [findByUnique(constraintName, value)](dev-docs/model-surface.md#findbyuniqueconstraintname-value) | 🟢 | **Divergent shape** — JS has a dedicated `async` `findByUnique` (bare value, or an array for a compound constraint). |
| [query(filter?, options?)](dev-docs/model-surface.md#queryfilter-options) | 🟢 | **Divergent shape** — JS returns a `PaginatedResult<Task>` — rows on `.data`, plus `.nextCursor` / `.hasMore`. |
| [queryOne(filter?, options?)](dev-docs/model-surface.md#queryonefilter-options) | 🟢 | **Divergent shape** — JS has a dedicated `queryOne`; the Swift model facade has none — take `.first` of a sorted `Task.query(...)` (#955). |
| [query — paginate](dev-docs/model-surface.md#query-paginate) | 🔴 | **Swift parity gap** — JS carries `PaginatedResult.nextCursor` forward via `uniqueStartKey` on the same `query()`. |
| [count(filter?)](dev-docs/model-surface.md#countfilter) | 🟢 | **Divergent shape** — JS `Task.count` is `async`; Swift `Task.count` is a synchronous static returning an `Int`, counting across every open document. |
| [aggregate(options)](dev-docs/model-surface.md#aggregateoptions) | 🔴 | **Swift parity gap** — Swift `Task.aggregate` is a static returning untyped `[[String: Any]]` rows (vs JS's typed result). |
| [subscribe(callback)](dev-docs/model-surface.md#subscribecallback) | 🟢 | **Divergent shape** — Both clients expose `Task.subscribe`. |
| [upsert (save with upsertOn)](dev-docs/model-surface.md#upsert-save-with-upserton) | 🟢 | **Divergent shape** — JS expresses this as `save({ upsertOn: "email" })` on the typed instance. |
| [update](dev-docs/model-surface.md#update) | 🟢 | **Divergent shape** — Both clients now update the same way: load the record, mutate fields on the value, then persist. |
| [delete()](dev-docs/model-surface.md#delete) | 🟢 | **Divergent shape** — Both clients load the record and call `delete` on the instance. |

## prompts

| Section | Flag | Divergence |
|---|---|---|
| [execute(promptKey, options)](dev-docs/prompts.md#executepromptkey-options) | 🟢 | **Divergent shape** — Swift additionally carries a positional `execute(promptKey:variables:modelOverride:configId:)` overload with no JS analog — prefer the options-struct form for cross-client parity. |
| [get(promptKey)](dev-docs/prompts.md#getpromptkey) | 🔴 | **Swift-only — broken at runtime** — Swift exposes `prompts.get`, but it calls an app-api route (`GET /prompts/{key}`) that doesn't exist, so it returns a 404 at runtime (#993). |
| [list()](dev-docs/prompts.md#list) | 🔴 | **Swift-only — broken at runtime** — Swift exposes `prompts.list`, but it calls an app-api route (`GET /prompts`) that doesn't exist, so it returns a 404 at runtime (#993). |

## workflows

| Section | Flag | Divergence |
|---|---|---|
| [start(options)](dev-docs/workflows.md#startoptions) | 🟢 | **Divergent shape** — Swift flattens the JS options object: `input` is a positional `[String: Any]` and the remaining idempotency/scoping fields move onto `StartWorkflowOptions`. |
| [getStatus(options)](dev-docs/workflows.md#getstatusoptions) | 🟢 | **Divergent shape** — `normalizedStatus` is Swift-only — JS `getStatus` returns `WorkflowStatusResult` with no such field, so code that reads `status.normalizedStatus` won't port across clients. |
| [terminate(options)](dev-docs/workflows.md#terminateoptions) | 🟢 | **Divergent shape** — JS carries `contextDocId` inside the `TerminateWorkflowOptions` object; Swift takes it as a third optional positional parameter (`terminate(workflowKey:runKey:contextDocId:)`, defaulting to `nil`). |
| [listRuns(options?)](dev-docs/workflows.md#listrunsoptions) | 🟢 | **Divergent shape** — JS passes the filters as a flat inline object (`listRuns({ workflowKey, status, limit })`); Swift wraps them in a named `ListWorkflowRunsOptions` struct passed as `options:`. |
