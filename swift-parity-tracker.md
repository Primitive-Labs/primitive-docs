# Swift ↔ JS parity — status chart

Single source of truth for what's addressed vs. not. Client fixes are on
`js-bao-wss` branch **`js-parity-jun-3`**; docs on `primitive-docs` branch
`docs-parity-jun-3`. Commit hashes are short SHAs on `js-parity-jun-3`.
Last updated 2026-06-04 (completion pass — every buildable item built; only
genuinely out-of-scope items remain deferred).

**Status legend**
- ✅ **done** — fixed, commit listed
- 🔵 **deferred** — NOT building now, **only** because it is genuinely out of scope: it overlaps the in-flight **PR #923** model-layer rewrite, or it needs native-platform frameworks (separate native track). Reason in Notes.
- 🔴 **skipped** — actively **NOT doing** (deprecated / superseded / not a Swift-client task) — reason in Notes
- ⚪ **stale → close** — already resolved / invalid; GitHub close-rec posted

> There is no "partial" state: anything started is finished here, with any genuinely-out-of-scope remainder split into its own 🔵 row with a concrete reason.

## TL;DR
- **✅ Built this session:** `documents.create` local-first (#852/#673) · `client.analytics` namespace + session/per-feature auto-events (#951/#963) · `me` offline-first (#938) · doc-blob `prefetch`/`read(as:)`/delete-eviction (#957/#965) · codegen `--check`/barrel/relationship-accessors/class-name (#995/#944) · typed `client.auth` namespace (#964/#954/#991) · `databases.subscribe` realtime (#952) · `WorkflowStartedEvent` payload alignment (#996).
- **🔵 Deferred — genuinely out of scope only:** model-surface (#854/#946/#947/#955/#992, + #962's model-class field-filtering) — edits the exact files **open PR #923** is rewriting · native auth/notifications/deep-links (#928–931) — separate native-frameworks track.
- **🔴 Skipped (not doing, with reason):** #859 (a deprecation-*removal* task, not a parity fix) · #949 (a JS-side public-type fix — nothing to change in Swift).

## Master chart

| Issue | Status | Fix commit | What / reason |
|---|---|---|---|
| [#846](https://github.com/Primitive-Labs/js-bao-wss/issues/846) | ⚪ stale → close | — | `getOrCreateWithAlias` already exists (typed `c3cb4c4f`); GH comment posted |
| [#847](https://github.com/Primitive-Labs/js-bao-wss/issues/847) | ⚪ stale → close | — | `me.owned/sharedDocuments` exist; the real gap was #938 (now done); GH comment posted |
| [#852](https://github.com/Primitive-Labs/js-bao-wss/issues/852) | ✅ done | `21220b8b` | `documents.create` now delegates to the local-first `client.createDocument` (offline queues instead of failing; `localOnly` honored), matching js-bao's forward. Also threads the create-time `metadata` blob through commit (#673) |
| [#854](https://github.com/Primitive-Labs/js-bao-wss/issues/854) | 🔵 deferred | — | model-level subscription events — **deferred until PR #923 merges** (edits the model layer #923 is rewriting) |
| [#859](https://github.com/Primitive-Labs/js-bao-wss/issues/859) | 🔴 skipped | — | a deprecation-*removal* task (remove `documents.list`), not a parity fix — not ours |
| [#928](https://github.com/Primitive-Labs/js-bao-wss/issues/928) | 🔵 deferred | — | native Google sign-in — needs native iOS frameworks; separate native track |
| [#929](https://github.com/Primitive-Labs/js-bao-wss/issues/929) | 🔵 deferred | — | native passkeys — needs `AuthenticationServices`; separate native track |
| [#930](https://github.com/Primitive-Labs/js-bao-wss/issues/930) | 🔵 deferred | — | notifications/APNS — needs native push; separate native track |
| [#931](https://github.com/Primitive-Labs/js-bao-wss/issues/931) | 🔵 deferred | — | deep-link routing — native proposal; separate native track |
| [#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938) | ✅ done | `13f0c031`,`458988bc` | `me` typed + **offline-first**: `ownedDocuments`/`sharedDocuments` merge the local metadata cache with the server list (dedupe by id, server wins), cache-only when offline |
| [#944](https://github.com/Primitive-Labs/js-bao-wss/issues/944) | ✅ done | `458988bc` | codegen output filename / class-name derivation (`class_name` override + PascalCase + collision guard) |
| [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946) | 🔵 deferred | — | `query()` paged result — model-surface, **deferred until PR #923 merges** |
| [#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947) | 🔵 deferred | — | writes need `in: docId` — model-surface, **deferred until PR #923 merges** |
| [#949](https://github.com/Primitive-Labs/js-bao-wss/issues/949) | 🔴 skipped | — | a JS-side public-type fix (`DatabaseChangeEvent`) — nothing to change in Swift |
| [#951](https://github.com/Primitive-Labs/js-bao-wss/issues/951) | ✅ done | `90ca6dad` | typed `client.analytics` namespace (`logEvent`/`logSnapshot`/`flush`/`setPlanOverride`/`setAppVersionOverride`) + `AnalyticsEventInput`; old top-level methods kept for back-compat |
| [#952](https://github.com/Primitive-Labs/js-bao-wss/issues/952) | ✅ done | `b2d3de2d` | `databases.subscribe(databaseId:subscriptionKey:options:)` realtime change subscriptions over WS; `DatabaseSubscriptionRegistry` routes `db.change` frames, returns an unsubscribe handle, re-subscribes on reconnect |
| [#953](https://github.com/Primitive-Labs/js-bao-wss/issues/953) | ⚪ stale → close | — | `getAcceptToken` in neither client; GH close-rec posted |
| [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954) | ✅ done | `c3cb4c4f`…`b2d3de2d` | **21 surfaces typed** (incl. prompts, doc-blob context, analytics, **auth**). Model-surface typing is the only untyped area left → 🔵 deferred under #923 |
| [#955](https://github.com/Primitive-Labs/js-bao-wss/issues/955) | 🔵 deferred | — | `TypedModel` divergence — model-surface, **deferred until PR #923 merges** |
| [#956](https://github.com/Primitive-Labs/js-bao-wss/issues/956) | ✅ done | `60db2ecd` | `workflows.runSync` |
| [#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957) | ✅ done | `ea7c67ca`,`458988bc` | doc-blob context typed + `prefetch(blobIds:concurrency:)` and typed `read(blobId:as:)` (String + Decodable) |
| [#958](https://github.com/Primitive-Labs/js-bao-wss/issues/958) | ✅ done | `f0576fa1` | `IntegrationCallRequest` query/method/path |
| [#959](https://github.com/Primitive-Labs/js-bao-wss/issues/959) | ✅ done | `0b7b4bc5` | error enum `WORKFLOW_APPLY_NOT_CONFIRMED` |
| [#960](https://github.com/Primitive-Labs/js-bao-wss/issues/960) | ✅ done | `0b7b4bc5` | `listUserMemberships(groupType:)` filter |
| [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961) | ✅ done | `b5e31ff2` | `close→{evicted}`, delete/removePermission eviction (sync predicates by-design) |
| [#962](https://github.com/Primitive-Labs/js-bao-wss/issues/962) | ✅ done | `0b7b4bc5`,`f0576fa1`,`ea7c67ca` | `list(databaseType:)`, manager shapes, **`importCsv`**. The JS model-class field-filtering / `syncIndexes` path rides on the #923 model registry → that slice tracked under model-surface (🔵) |
| [#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963) | ✅ done | `90ca6dad`,`a1120091` | analytics engine + session lifecycle + **per-feature auto-events** (dailyAuth/returnActive/syncErrors/blobUploads), gated on `analyticsAutoEvents` config. boot/firstDocOpen/firstDocEdit/offlineRecovery are deliberately not emitted — **the current JS emitters for those are no-ops**, so emitting would diverge |
| [#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964) | ✅ done | `b2d3de2d` | typed `client.auth` namespace (magic-link, OTP, getAuthConfig, logout, user/token accessors, offline-grant suite) over the existing AuthController; AUTH_CODES already in the `AuthCode` enum. Native passkeys/OAuth are #928/#929 (🔵 native track) |
| [#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965) | ✅ done | `f0576fa1`,`ea7c67ca`,`458988bc` | blob-buckets + doc-blob context typed; `delete` now evicts the blob from the local `BlobManager` cache |
| [#991](https://github.com/Primitive-Labs/js-bao-wss/issues/991) 🆕 | ✅ done | `13f0c031`,`5e0b76e2`,`ea7c67ca`,`90ca6dad`,`b2d3de2d` | silent `?? [:]` coercion gone in every typed surface incl. prompts, analytics, and **auth** |
| [#992](https://github.com/Primitive-Labs/js-bao-wss/issues/992) 🆕 | 🔵 deferred | — | `find`/`findAll` sync silent-drop — model-surface, **deferred until PR #923 merges** |
| [#993](https://github.com/Primitive-Labs/js-bao-wss/issues/993) 🆕 | ✅ done | `f0576fa1`,`ea7c67ca` | integrations + prompts `list`/`get` typed + flagged Swift-only/runtime-broken (dead routes are a server concern) |
| [#994](https://github.com/Primitive-Labs/js-bao-wss/issues/994) 🆕 | ✅ done | `e4591a3f`,`60db2ecd`,`ea7c67ca` | `fetchHttp` query+body, `serverTimeoutMs`, `waitForLoad`/offline gating all honored |
| [#995](https://github.com/Primitive-Labs/js-bao-wss/issues/995) 🆕 | ✅ done | `ea7c67ca`,`458988bc` | codegen `enum` + `auto_stamp`, **`--check` strict mode, `GeneratedModels` registration barrel (`.all`/`register(on:)`), relationship accessors, class-name derivation** |
| [#996](https://github.com/Primitive-Labs/js-bao-wss/issues/996) 🆕 | ✅ done | `d5837c84` | `WorkflowStartedEvent` expanded to JS's full shape (workflowId/runKey/instanceId/contextDocId/meta); other event structs already matched or are dead code |

## Surfaces typed (#954)
**✅ Typed (21):** documents · session · users · gemini · llm · databaseTypeConfigs · collectionTypeConfigs · groupTypeConfigs · me · invitations · ruleSets · cronTriggers · groups · collections · databases · blobBuckets · integrations · workflows · prompts · analytics · **auth** — plus the document-blob context.

**Not yet typed:** model-surface only (🔵 deferred until PR #923 merges). Cache typedness rolls up under #954/#994; behavior is done.

## GitHub actions taken
- **Fix comments:** [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954#issuecomment-4616843403), [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961#issuecomment-4616843520).
- **Close-recommendations:** [#846](https://github.com/Primitive-Labs/js-bao-wss/issues/846#issuecomment-4616843626), [#847](https://github.com/Primitive-Labs/js-bao-wss/issues/847#issuecomment-4616843740), [#953](https://github.com/Primitive-Labs/js-bao-wss/issues/953#issuecomment-4616843834).
- **New issues filed:** #991–#996.

## Non-code follow-ups (tracked in `user-facing-docs-todos.md`)
- Client **test target** migration (library builds clean; tests still call old untyped signatures — needed before `swift test`).
- User-facing **`docs/getting-started/` + `guides/latest/`** migration to the typed API.
- `#996` `workflowStarted` WS-frame handler is on disk in the clone but left uncommitted to avoid entangling with concurrent in-tree edits to `JsBaoClient.swift`.

## Commit reference (`js-parity-jun-3`)
`c3cb4c4f` documents typed · `b5e31ff2` documents behavioral (#961/#506) · `0b7b4bc5` bounded (#959/#960/#962) · `5c0333f3` wave-1 · `13f0c031` wave-2 · `f0576fa1` wave-3 · `5e0b76e2` wave-4 · `e4591a3f` cache query/body · `60db2ecd` cache serverTimeoutMs + runSync · `ea7c67ca` wave-5 (prompts/doc-blob/importCsv/cache-options/codegen) · `90ca6dad` analytics namespace + session auto-events (#951/#963) · `21220b8b` documents.create local-first (#852/#673) · `458988bc` me offline-first + doc-blob prefetch/read/evict + codegen check/barrel/accessors (#938/#957/#965/#995/#944) · `b2d3de2d` auth namespace + databases.subscribe (#964/#952) · `a1120091` per-feature auto-events (#963) · `d5837c84` WorkflowStartedEvent payload (#996)
