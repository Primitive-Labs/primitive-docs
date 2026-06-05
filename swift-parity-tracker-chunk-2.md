# Swift ↔ JS parity — chunk 2 (status chart)

Second-pass parity tracker. Companion to `swift-parity-tracker.md` (chunk 1).
Client work targets `js-bao-wss` branch **`js-parity-chunk-2-jun-4`**; chunk-2 docs
on `primitive-docs` branch `docs-parity-jun-4`; the Jun 4–5 sweep below is on
`swift-integration`. Commit hashes are short SHAs. Last updated 2026-06-05.

**Status legend**
- ✅ **done** — fixed, commit listed (some are still OPEN on GitHub → close-rec noted in reason)
- 🔵 **deferred** — NOT building now, **only** because it is genuinely out of scope (native track / server-side / platform-direction) or is a scoped model-layer remainder. Reason in What / reason.
- 🔴 **skipped** — actively **NOT doing** (JS-side / deprecated / not a swift-client task). Reason in What / reason.
- ⚪ **stale → close** — already resolved / invalid; GitHub close-rec posted.

> No "partial" state: anything started is finished here, with any genuinely-out-of-scope remainder split into its own 🔵 row with a concrete reason.

## TL;DR
- **✅ Built (chunk-2 clone `58611d78`, PR-#1032 follow-ups `5bfa6160`):** DoDb direct-record handle (#1019) · analytics offline eviction (#1027) · app-wide blob upload-queue + open options (#1038) · gemini error normalization (#1039) · groups `?type=` bug (#1040) · users `getBasic` options (#1041) · cache events (#1042) · codegen `auto_stamp`/`enum` (#1056) · behavioral fixes (#1057).
- **✅ Built (Jun 4–5 sweep, clone `4ddf0bdd`):** `documents.removePermission` collapsed to one `DocumentPermissionTarget` union (matches JS `string | {userId} | {email}`) · `me.cacheInfo()` returns a named `MeCacheInfo` struct.
- **🔵 Deferred remainder:** model-surface `aggregate` facade `groupBy` — StringSet membership + facet grouping (needs cross-doc junction SQL). The cited #954 is **closed** + broad-typing-scoped, so this needs its own issue. PR **#923 (model-layer rewrite) is now closed**, so the old "deferred until #923 merges" blocker is gone → unblocked, scoped for a focused pass. · #967 / #1058 cross-client + live-server slices.
- **Swept clean (at parity, no issue):** databases · collections · database/collection/group-type-configs · workflows · prompts · auth · session · me · invitations · integrations · blob-buckets · cron-triggers · rule-sets · llm · analytics · errors · codegen · model-surface (typing). The stale `WorkflowStartedEvent` callout in `dev-docs/workflows.md` was removed (the Swift struct already carries the full payload).

## Master chart

| Issue | Status | Fix commit | What / reason |
|---|---|---|---|
| [#561](https://github.com/Primitive-Labs/js-bao-wss/issues/561) | ✅ done | PR #627 | `BaseModel` stringset wire format compat with swift-client (yswift) |
| [#562](https://github.com/Primitive-Labs/js-bao-wss/issues/562) | ✅ done | `fe6eb69e` | `QueryOptions.offset` deprecated → cursor pagination (cross-lang) |
| [#625](https://github.com/Primitive-Labs/js-bao-wss/issues/625) | ✅ done | `7632c143` (PR #866) | Harden `getFromYjs` against composite Yjs primitives |
| [#737](https://github.com/Primitive-Labs/js-bao-wss/issues/737) | ✅ done | PR #786 | Database changed-subscription events (origin tagging) |
| [#811](https://github.com/Primitive-Labs/js-bao-wss/issues/811) | ✅ done | PR #828 | Schema validator: aggregate `sort.field` not a record field |
| [#848](https://github.com/Primitive-Labs/js-bao-wss/issues/848) | ✅ done | `bdb891cb` | Swift `documents.list()` deprecated + `includeRoot` option |
| [#849](https://github.com/Primitive-Labs/js-bao-wss/issues/849) | ✅ done | `d89c65dc` | Swift `getRootDocId()` non-existent endpoint |
| [#850](https://github.com/Primitive-Labs/js-bao-wss/issues/850) | ✅ done | `2ddfa444` | Swift auth errors now parse structured server bodies |
| [#851](https://github.com/Primitive-Labs/js-bao-wss/issues/851) | ✅ done | `d89c65dc` | Swift `getRootDocId()` reads from JWT payload |
| [#853](https://github.com/Primitive-Labs/js-bao-wss/issues/853) | ✅ done | `a5e19202` | Swift `createDocument(localOnly:)` SQLite namespace conflict |
| [#908](https://github.com/Primitive-Labs/js-bao-wss/issues/908) | ✅ done | `40fdd275` | `/me/shared-documents` tag filter dropped tagged docs |
| [#918](https://github.com/Primitive-Labs/js-bao-wss/issues/918) | ✅ done | `0aa69e7c`,`7baee9cf` | Cross-doc query drift → `Model.*` static facade + `save()` (one-model API). **OPEN on GH → recommend close** |
| [#1019](https://github.com/Primitive-Labs/js-bao-wss/issues/1019) | ✅ done | `58611d78` | `databases.connect()` / `DoDb` direct-record handle (`save`/`patch`/`find`/`query`/`count`/`aggregate`/`increment`/`addToSet`/`removeFromSet`/`batch` + index mgmt), mirroring JS |
| [#1023](https://github.com/Primitive-Labs/js-bao-wss/issues/1023) | ✅ done | `458988bc` | `prefetch` exposed on the public document-blob accessor. **OPEN on GH → recommend close** |
| [#1024](https://github.com/Primitive-Labs/js-bao-wss/issues/1024) | ✅ done | `90ca6dad`,`a1120091` | `analytics.logSnapshot` + `analyticsAutoEvents` config. **OPEN on GH → recommend close** |
| [#1027](https://github.com/Primitive-Labs/js-bao-wss/issues/1027) | ✅ done | `58611d78` | Analytics offline persistence enforces `maxPersistedBytes` (1 MiB), oldest-first eviction |
| [#1038](https://github.com/Primitive-Labs/js-bao-wss/issues/1038) | ✅ done | `58611d78` | App-wide (cross-document) blob upload-queue control + `OpenDocumentOptions.availabilityWaitMs`/`deferNetworkSync` |
| [#1039](https://github.com/Primitive-Labs/js-bao-wss/issues/1039) | ✅ done | `58611d78` | Provider/transport failures normalized to `JsBaoError(GEMINI_ERROR)` across `generate`/`countTokens`/`generateRaw` |
| [#1040](https://github.com/Primitive-Labs/js-bao-wss/issues/1040) 🐞 | ✅ done | `58611d78` | **Bug fix:** `listUserMemberships` now sends `?type=` (was `?groupType=`, a silent no-op). Independently fixed in PR #1032 (de-duped on rebase) |
| [#1041](https://github.com/Primitive-Labs/js-bao-wss/issues/1041) | ✅ done | `58611d78` | `getBasic` honors `GetUserOptions`/caches (no-facade path honors `waitForLoad`) |
| [#1042](https://github.com/Primitive-Labs/js-bao-wss/issues/1042) | ✅ done | `58611d78` | `KvCache` emits `cacheUpdated`/`cacheUpdateFailed` via `client.events`. (me-record re-emit deferred — `.meUpdated` payload-shape) |
| [#1056](https://github.com/Primitive-Labs/js-bao-wss/issues/1056) | ✅ done | `5bfa6160` | codegen: `auto_stamp` applied on write (FieldDescriptor slot + shared-save stamping); keyword-named `enum` field emits a sanitized type name; `AutoStampWriteTests` |
| [#1057](https://github.com/Primitive-Labs/js-bao-wss/issues/1057) | ✅ done | `5bfa6160` | behavioral: `GeminiRole` tolerant decode (`.other`); `enumCaseIdentifier` rejects Unicode digits; `databases.subscribe` throws on empty id; `UNSYNCED_CHANGES` documented Swift-only; `save()` short-circuits unchanged updates |
| _removePermission union_ (issue pending) | ✅ done | `4ddf0bdd` | `documents.removePermission` collapsed from `userId:`/`email:` overloads to one `DocumentPermissionTarget` union arg, matching JS `string \| {userId} \| {email}` (bare string literal == `.userId`) |
| _cacheInfo struct_ (issue pending) | ✅ done | `4ddf0bdd` | `me.cacheInfo()` returns a named `MeCacheInfo` struct instead of an anonymous tuple, mirroring JS `{ updatedAt?, ageMs? }` |
| _aggregate facade groupBy_ (issue pending) | 🔵 deferred | — | model-surface: widen facade `AggregateOptions.groupBy` `[String]` → `field \| StringSetMembership`, add cross-doc junction SQL for membership + facet grouping (keeping Swift's flat-rows shape). Cited #954 is **closed** + broad-typing-scoped → needs its own issue. **PR #923 closed → unblocked.** |
| [#967](https://github.com/Primitive-Labs/js-bao-wss/issues/967) | 🔵 deferred | `58611d78` (Swift side) | Swift success terminal status normalized to `"completed"`. **JS-side `getStatus` alignment still pending** (cross-client, breaking) |
| [#1058](https://github.com/Primitive-Labs/js-bao-wss/issues/1058) | 🔵 deferred | `5bfa6160` (partial) | ✅ restored strict `try await` on 30 `ApiParity` decodes. **Deferred:** new-surface live-server coverage + re-enable `AppCleanupTests` (blocked on a live dev server / a JS-side sync-bug fix) |
| [#1020](https://github.com/Primitive-Labs/js-bao-wss/issues/1020) | 🔵 deferred | — | Blob-bucket `owner-only` policy excludes uploader — server-side controller behavior, not a swift-client parity item |
| [#1011](https://github.com/Primitive-Labs/js-bao-wss/issues/1011) | 🔵 deferred | — | Deprecate direct client LLM APIs — platform-direction, affects both clients equally |
| [#876](https://github.com/Primitive-Labs/js-bao-wss/issues/876) | 🔴 skipped | — | Make generated model objects spreadable — JS-side (`toJSON`/getters), nothing to change in Swift |
| [#721](https://github.com/Primitive-Labs/js-bao-wss/issues/721) | 🔵 deferred | — | Native Rust client — research, separate client |
| [#779](https://github.com/Primitive-Labs/js-bao-wss/issues/779) | 🔵 deferred | — | Multi-channel notifications — native track (relates #930) |
| [#993](https://github.com/Primitive-Labs/js-bao-wss/issues/993) | ✅ done | `f0576fa1`,`ea7c67ca` | integrations + prompts `list`/`get` typed + flagged Swift-only/runtime-broken (PR #1032's "drop orphaned routes" suggestion left here, not refiled) |
