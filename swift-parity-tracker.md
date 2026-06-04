# Swift ↔ JS parity — status chart

Single source of truth for what's addressed vs. not. Client fixes are on
`js-bao-wss` branch **`js-parity-jun-3`**; docs on `primitive-docs` branch
`docs-parity-jun-3`. Commit hashes are short SHAs on `js-parity-jun-3`.
Last updated 2026-06-04 (all ❓ needs-decision items resolved: analytics built, auth + model-surface deferred).

**Status legend**
- ✅ **done** — fixed, commit listed
- 🟡 **partial** — some done (commit), the rest carries its own status in Notes
- 🔵 **deferred** — we WILL do it, just **later** (no blocker; includes native/scope items on a separate track)
- ❓ **needs your decision** — blocked on a design call before I build
- 🔴 **skipped** — actively **NOT doing** (deprecated / superseded / not a Swift-client task) — reason in Notes
- ⚪ **stale → close** — already resolved / invalid; GitHub close-rec posted

> **deferred ≠ skipped.** 🔵 deferred = on the list, will build later. 🔴 skipped = we are not building it (with a concrete reason).

## TL;DR
- **✅ Just built — `client.analytics` namespace + auto-engine:** typed `client.analytics.{logEvent,logSnapshot,flush,setPlanOverride,setAppVersionOverride}` (#951 done), session-lifecycle auto-events + flush-on-connect/background (#963 engine+session done; per-feature catalog still deferred).
- **🔵 Deferred (I'll build these later — say go):** doc-blob `prefetch`/`read(as:)` (#957) · doc-blob delete-eviction (#965) · `databases.subscribe` (#952) · `me` offline-first (#938 rest) · codegen filenames (#944) · codegen `--check`/relationship-accessors/barrel (#995 rest) · per-feature analytics auto-events (#963 rest) · **auth parity (#964 — your call: defer all)** · **model-surface (#854/#946/#947/#955/#992 — deferred until PR #923 merges)** · native auth/notifications (#928–931, separate native track).
- **❓ Needs your decision before I build:** _(none — all resolved 2026-06-04)_.
- **🔴 Skipped (not doing, with reason):** #859 (a deprecation-*removal* task, not a parity fix) · #949 (a JS-side public-type fix — nothing to change in Swift).

## Master chart

| Issue | Status | Fix commit | What / reason |
|---|---|---|---|
| [#846](https://github.com/Primitive-Labs/js-bao-wss/issues/846) | ⚪ stale → close | — | `getOrCreateWithAlias` already exists (typed `c3cb4c4f`); GH comment posted |
| [#847](https://github.com/Primitive-Labs/js-bao-wss/issues/847) | ⚪ stale → close | — | `me.owned/sharedDocuments` exist; real gap is #938; GH comment posted |
| [#852](https://github.com/Primitive-Labs/js-bao-wss/issues/852) | ✅ done | `21220b8b` | `documents.create` now delegates to the local-first `client.createDocument` (offline queues instead of failing; `localOnly` honored), matching js-bao's forward. Also threads the create-time `metadata` blob through commit (#673) |
| [#854](https://github.com/Primitive-Labs/js-bao-wss/issues/854) | 🔵 deferred | — | model-level subscription events — **deferred until PR #923 merges** (model-surface) |
| [#859](https://github.com/Primitive-Labs/js-bao-wss/issues/859) | 🔴 skipped | — | a deprecation-*removal* task (remove `documents.list`), not a parity fix — not ours |
| [#928](https://github.com/Primitive-Labs/js-bao-wss/issues/928) | 🔵 deferred (scope) | — | native Google sign-in — separate native track |
| [#929](https://github.com/Primitive-Labs/js-bao-wss/issues/929) | 🔵 deferred (scope) | — | native passkeys — separate native track |
| [#930](https://github.com/Primitive-Labs/js-bao-wss/issues/930) | 🔵 deferred (scope) | — | notifications/APNS — native proposal |
| [#931](https://github.com/Primitive-Labs/js-bao-wss/issues/931) | 🔵 deferred (scope) | — | deep-link routing — native proposal |
| [#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938) | 🟡 partial | `13f0c031` | typed ✅. Remaining: offline-first cache-merge = 🔵 deferred |
| [#944](https://github.com/Primitive-Labs/js-bao-wss/issues/944) | 🔵 deferred | — | codegen TOML filenames (in the codegen tool, separate from client typing) |
| [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946) | 🔵 deferred | — | `query()` paged result — model-surface, **deferred until PR #923 merges** |
| [#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947) | 🔵 deferred | — | writes need `in: docId` — model-surface, **deferred until PR #923 merges** |
| [#949](https://github.com/Primitive-Labs/js-bao-wss/issues/949) | 🔴 skipped | — | a JS-side public-type fix (`DatabaseChangeEvent`) — nothing to change in Swift |
| [#951](https://github.com/Primitive-Labs/js-bao-wss/issues/951) | ✅ done | `90ca6dad` | typed `client.analytics` namespace (`logEvent`/`logSnapshot`/`flush`/`setPlanOverride`/`setAppVersionOverride`) + `AnalyticsEventInput`; old top-level methods kept for back-compat |
| [#952](https://github.com/Primitive-Labs/js-bao-wss/issues/952) | 🔵 deferred | — | `databases.subscribe()` — WS feature to build |
| [#953](https://github.com/Primitive-Labs/js-bao-wss/issues/953) | ⚪ stale → close | — | `getAcceptToken` in neither client; GH close-rec posted |
| [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954) | 🟡 partial | `c3cb4c4f`…`90ca6dad` | **20 surfaces typed ✅** (incl. prompts, doc-blob context, **analytics**). Remaining: auth typedness = 🔵 deferred (#964); model-surface = 🔵 deferred (#923) |
| [#955](https://github.com/Primitive-Labs/js-bao-wss/issues/955) | 🔵 deferred | — | `TypedModel` divergence — model-surface, **deferred until PR #923 merges** |
| [#956](https://github.com/Primitive-Labs/js-bao-wss/issues/956) | ✅ done | `60db2ecd` | `workflows.runSync` |
| [#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957) | 🟡 partial | `ea7c67ca` | doc-blob context typed ✅; `prefetch`/`read(as:)` methods = 🔵 deferred (features) |
| [#958](https://github.com/Primitive-Labs/js-bao-wss/issues/958) | ✅ done | `f0576fa1` | `IntegrationCallRequest` query/method/path |
| [#959](https://github.com/Primitive-Labs/js-bao-wss/issues/959) | ✅ done | `0b7b4bc5` | error enum `WORKFLOW_APPLY_NOT_CONFIRMED` |
| [#960](https://github.com/Primitive-Labs/js-bao-wss/issues/960) | ✅ done | `0b7b4bc5` | `listUserMemberships(groupType:)` filter |
| [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961) | ✅ done | `b5e31ff2` | `close→{evicted}`, delete/removePermission eviction (sync predicates by-design) |
| [#962](https://github.com/Primitive-Labs/js-bao-wss/issues/962) | ✅ done | `0b7b4bc5`,`f0576fa1`,`ea7c67ca` | `list(databaseType:)`, manager shapes, **and `importCsv`** (the JS model-class field-filtering / `syncIndexes` path isn't ported — Swift requires explicit `types`) |
| [#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963) | 🟡 partial | `90ca6dad` | engine + session lifecycle done (queue auto-flush on connect/background, `session_end` w/ `duration_ms`). Remaining: per-feature auto-event catalog (boot/dailyAuth/firstDocOpen/offlineRecovery/syncErrors/blobUploads/serviceWorker/llm-gemini) + `analyticsAutoEvents` config = 🔵 deferred |
| [#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964) | 🔵 deferred | — | auth parity (`AUTH_CODES`, magic-link/OTP/offline-grant option surfaces) — **your call 2026-06-04: defer all**. Native passkeys/OAuth are #928/#929 (separate native track) |
| [#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965) | 🟡 partial | `f0576fa1`,`ea7c67ca` | blob-buckets + doc-blob context typed ✅. Remaining: doc-blob delete-eviction + `prefetch` = 🔵 deferred (see #957) |
| [#991](https://github.com/Primitive-Labs/js-bao-wss/issues/991) 🆕 | 🟡 partial | `13f0c031`,`5e0b76e2`,`ea7c67ca`,`90ca6dad` | silent `?? [:]` coercion gone in every typed surface incl. prompts + analytics ✅. Remaining: auth = 🔵 deferred (#964) |
| [#992](https://github.com/Primitive-Labs/js-bao-wss/issues/992) 🆕 | 🔵 deferred | — | `find`/`findAll` sync silent-drop — model-surface, **deferred until PR #923 merges** |
| [#993](https://github.com/Primitive-Labs/js-bao-wss/issues/993) 🆕 | ✅ done | `f0576fa1`,`ea7c67ca` | integrations + prompts `list`/`get` typed + flagged Swift-only/runtime-broken (the dead routes are a server concern) |
| [#994](https://github.com/Primitive-Labs/js-bao-wss/issues/994) 🆕 | ✅ done | `e4591a3f`,`60db2ecd`,`ea7c67ca` | `fetchHttp` query+body, `serverTimeoutMs`, **and `waitForLoad`/offline gating** all honored (key-portability typedness rolls up under #954) |
| [#995](https://github.com/Primitive-Labs/js-bao-wss/issues/995) 🆕 | 🟡 partial | `ea7c67ca` | codegen `enum` + `auto_stamp` now supported. Remaining: `--check`/strict, relationship accessors, registration barrel, class-name derivation = 🔵 deferred |
| [#996](https://github.com/Primitive-Labs/js-bao-wss/issues/996) 🆕 | 🔵 deferred | — | event-payload divergences (touches shared `Events.swift` + emit sites) |

## Surfaces typed (#954)
**✅ Typed (20):** documents · session · users · gemini · llm · databaseTypeConfigs · collectionTypeConfigs · groupTypeConfigs · me · invitations · ruleSets · cronTriggers · groups · collections · databases · blobBuckets · integrations · workflows · prompts · **analytics** — plus the document-blob context.

**Not yet typed:** `auth` (🔵 deferred — #964, your call) · model-surface (🔵 deferred until PR #923 merges). (Cache typedness rolls up under #954/#994; behavior is done.)

## GitHub actions taken
- **Fix comments:** [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954#issuecomment-4616843403), [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961#issuecomment-4616843520).
- **Close-recommendations:** [#846](https://github.com/Primitive-Labs/js-bao-wss/issues/846#issuecomment-4616843626), [#847](https://github.com/Primitive-Labs/js-bao-wss/issues/847#issuecomment-4616843740), [#953](https://github.com/Primitive-Labs/js-bao-wss/issues/953#issuecomment-4616843834).
- **New issues filed:** #991–#996.

## Non-code follow-ups (tracked in `user-facing-docs-todos.md`)
- Client **test target** migration (library builds clean; tests still call old untyped signatures — needed before `swift test`).
- User-facing **`docs/getting-started/` + `guides/latest/`** migration to the typed API.

## Commit reference (`js-parity-jun-3`)
`c3cb4c4f` documents typed · `b5e31ff2` documents behavioral (#961/#506) · `0b7b4bc5` bounded (#959/#960/#962) · `5c0333f3` wave-1 · `13f0c031` wave-2 · `f0576fa1` wave-3 · `5e0b76e2` wave-4 · `e4591a3f` cache query/body · `60db2ecd` cache serverTimeoutMs + runSync · `ea7c67ca` wave-5 (prompts/doc-blob/importCsv/cache-options/codegen) · `90ca6dad` analytics namespace + session auto-events (#951/#963) · `21220b8b` documents.create local-first delegation (#852/#673)
