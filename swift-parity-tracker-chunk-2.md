# Swift ↔ JS parity — chunk 2 (status chart)

Second-pass parity tracker. Companion to `swift-parity-tracker.md` (chunk 1).
Client work targets `js-bao-wss` branch **`js-parity-chunk-2-jun-4`**; docs on
`primitive-docs` branch **`docs-parity-jun-4`**. Commit hashes are short SHAs.
Last updated 2026-06-04.

**Status legend**
- ✅ **done** — already fixed; fix commit listed (some are still OPEN on GitHub → recommend close)
- 🟠 **open gap** — real swift-client gap, issue open, not yet built
- 🔵 **out of scope** — not a swift-client-parity build (native track / server-side / platform-direction)
- 🆕 **filed this pass** — new issue opened by the chunk-2 discrepancy sweep (§2)

> This pass is **issues + tracking only — no implementation.**

---

## §1 — Existing GitHub issues not in chunk-1

Swift-client issues from the js-bao-wss tracker that weren't in `swift-parity-tracker.md`.
(Release-bot/inbox-dashboard/CLI-tooling noise and already-resolved historical
issues like #453 are excluded.)

### Already fixed ✅

| Issue | Fix commit | What |
|---|---|---|
| [#918](https://github.com/Primitive-Labs/js-bao-wss/issues/918) | `0aa69e7c`,`7baee9cf` | Cross-doc query drift → `Model.*` static facade + `save()` (one-model API). **OPEN on GH → recommend close** |
| [#1023](https://github.com/Primitive-Labs/js-bao-wss/issues/1023) | `458988bc` | `prefetch` exposed on the public document-blob accessor. **OPEN on GH → recommend close** |
| [#1024](https://github.com/Primitive-Labs/js-bao-wss/issues/1024) | `90ca6dad`,`a1120091` | `analytics.logSnapshot` + `analyticsAutoEvents` config. **OPEN on GH → recommend close** |
| [#561](https://github.com/Primitive-Labs/js-bao-wss/issues/561) | PR #627 | `BaseModel` stringset wire format compat with swift-client (yswift) |
| [#562](https://github.com/Primitive-Labs/js-bao-wss/issues/562) | `fe6eb69e` | `QueryOptions.offset` deprecated → cursor pagination (cross-lang) |
| [#625](https://github.com/Primitive-Labs/js-bao-wss/issues/625) | `7632c143` (PR #866) | Harden `getFromYjs` against composite Yjs primitives |
| [#737](https://github.com/Primitive-Labs/js-bao-wss/issues/737) | PR #786 | Database changed-subscription events (origin tagging) |
| [#811](https://github.com/Primitive-Labs/js-bao-wss/issues/811) | PR #828 | Schema validator: aggregate `sort.field` not a record field |
| [#848](https://github.com/Primitive-Labs/js-bao-wss/issues/848) | `bdb891cb` | Swift `documents.list()` deprecated + `includeRoot` option |
| [#849](https://github.com/Primitive-Labs/js-bao-wss/issues/849) | `d89c65dc` | Swift `getRootDocId()` non-existent endpoint |
| [#850](https://github.com/Primitive-Labs/js-bao-wss/issues/850) | `2ddfa444` | Swift auth errors now parse structured server bodies |
| [#851](https://github.com/Primitive-Labs/js-bao-wss/issues/851) | `d89c65dc` | Swift `getRootDocId()` reads from JWT payload |
| [#853](https://github.com/Primitive-Labs/js-bao-wss/issues/853) | `a5e19202` | Swift `createDocument(localOnly:)` SQLite namespace conflict |
| [#908](https://github.com/Primitive-Labs/js-bao-wss/issues/908) | `40fdd275` | `/me/shared-documents` tag filter dropped tagged docs |

### Open swift-client gaps → ✅ fixed this pass

| Issue | Status | What → fix |
|---|---|---|
| [#1019](https://github.com/Primitive-Labs/js-bao-wss/issues/1019) | ✅ `58611d78` | `databases.connect()` / `DoDb` direct-record handle added (`save`/`patch`/`find`/`query`/`count`/`aggregate`/`increment`/`addToSet`/`removeFromSet`/`batch` + index mgmt), mirroring JS |
| [#1027](https://github.com/Primitive-Labs/js-bao-wss/issues/1027) | ✅ `58611d78` | Analytics offline persistence now enforces `maxPersistedBytes` (1 MiB) with oldest-first eviction |
| [#967](https://github.com/Primitive-Labs/js-bao-wss/issues/967) | 🟡 `58611d78` | Swift success terminal status normalized to `"completed"` (matches the event + JS types). **JS-side `getStatus` alignment still pending** (cross-client, breaking) |

### Out of scope 🔵

| Issue | Why out of scope |
|---|---|
| [#1020](https://github.com/Primitive-Labs/js-bao-wss/issues/1020) | Blob-bucket `owner-only` policy excludes uploader — server-side controller behavior, not a swift-client parity item |
| [#1011](https://github.com/Primitive-Labs/js-bao-wss/issues/1011) | Deprecate direct client LLM APIs — platform-direction, affects both clients equally |
| [#876](https://github.com/Primitive-Labs/js-bao-wss/issues/876) | Make generated model objects spreadable — JS-side (`toJSON`/getters) |
| [#721](https://github.com/Primitive-Labs/js-bao-wss/issues/721) | Native Rust client — research, separate client |
| [#779](https://github.com/Primitive-Labs/js-bao-wss/issues/779) | Multi-channel notifications — native track (relates #930) |

---

## §2 — New parity issues filed this pass 🆕 → ✅ fixed

Discrepancies found by the per-sub-api sweep, filed as rolled-up GitHub issues,
then **fixed in the same pass** (clone commit `58611d78`; dev-docs updated).

| Issue | Status | Surface(s) | Rolled-up discrepancies → fix |
|---|---|---|---|
| [#1038](https://github.com/Primitive-Labs/js-bao-wss/issues/1038) | ✅ `58611d78` | documents / blobs | App-wide (cross-document) blob upload-queue control + `OpenDocumentOptions.availabilityWaitMs`/`deferNetworkSync` added |
| [#1039](https://github.com/Primitive-Labs/js-bao-wss/issues/1039) | ✅ `58611d78` | gemini | Provider/transport failures now normalized to `JsBaoError(GEMINI_ERROR)` across `generate`/`countTokens`/`generateRaw` |
| [#1040](https://github.com/Primitive-Labs/js-bao-wss/issues/1040) 🐞 | ✅ `58611d78` | groups | **Bug fix:** `listUserMemberships` now sends `?type=` (was `?groupType=`, a silent no-op) |
| [#1041](https://github.com/Primitive-Labs/js-bao-wss/issues/1041) | ✅ `58611d78` | users | `getBasic` now honors `GetUserOptions`/caches (no-facade path honors `waitForLoad`) |
| [#1042](https://github.com/Primitive-Labs/js-bao-wss/issues/1042) | ✅ `58611d78` | cache / events | `KvCache` now emits `cacheUpdated`/`cacheUpdateFailed`, surfaced via `client.events`. (me-record re-emit deferred — `.meUpdated` payload-shape) |

**Swept clean (no new issues — at parity or already tracked):** databases ·
collections · database/collection/group-type-configs · workflows · prompts ·
auth · session · me · invitations · integrations · blob-buckets · cron-triggers ·
rule-sets · llm · analytics · errors · codegen · model-surface. The stale red
`WorkflowStartedEvent` callout in `dev-docs/workflows.md` was removed (the Swift
struct already carries the full payload).
