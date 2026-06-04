# Swift ↔ JS parity — status chart

Single source of truth for what's addressed vs. not. Client fixes are on
`js-bao-wss` branch **`js-parity-jun-3`**; docs on `primitive-docs` branch
`docs-parity-jun-3`. Commit hashes are short SHAs on `js-parity-jun-3`.
Last updated 2026-06-04.

**Status legend**
- ✅ **done** — fixed, commit listed
- 🟡 **partial** — some done (commit), the rest carries its own status in Notes
- 🔵 **deferred** — we WILL do it, just **later** (no blocker; includes native/scope items on a separate track)
- ❓ **needs your decision** — blocked on a design call before I build
- 🔴 **skipped** — actively **NOT doing** (deprecated / superseded / not a Swift-client task) — reason in Notes
- ⚪ **stale → close** — already resolved / invalid; GitHub close-rec posted

> **deferred ≠ skipped.** 🔵 deferred = on the list, will build later. 🔴 skipped = we are not building it (with a concrete reason).

## TL;DR
- **🔵 Deferred (I'll build these later — say go):** `prompts`✅done · doc-blob `prefetch`/`read(as:)` (#957) · doc-blob delete-eviction (#965) · `databases.subscribe` (#952) · `me` offline-first (#938 rest) · codegen filenames (#944) · codegen `--check`/relationship-accessors/barrel (#995 rest) · native auth/notifications (#928–931, separate native track).
- **❓ Needs your decision before I build:** does Swift get a `client.analytics` namespace? (#951, and #963 engine rides on it) · how far does auth parity go? (#964) · model-surface direction — overlaps in-flight PR #923 (#854/#946/#947/#955/#992).
- **🔴 Skipped (not doing, with reason):** #852 (issue CLOSED — `client.createDocument` already provides local-first) · #859 (a deprecation-*removal* task, not a parity fix) · #949 (a JS-side public-type fix — nothing to change in Swift).

## Master chart

| Issue | Status | Fix commit | What / reason |
|---|---|---|---|
| [#453](https://github.com/Primitive-Labs/js-bao-wss/issues/453) | ✅ done | `f0576fa1` | groups `addMember` discriminated-union result |
| [#506](https://github.com/Primitive-Labs/js-bao-wss/issues/506) | ✅ done | `b5e31ff2` | `listGroupPermissions(includeSystem:)` (issue already CLOSED) |
| [#590](https://github.com/Primitive-Labs/js-bao-wss/issues/590) | ✅ done | `5c0333f3` | `groupType` percent-encoding |
| [#596](https://github.com/Primitive-Labs/js-bao-wss/issues/596) | ✅ done | `5c0333f3` | `collectionType` percent-encoding |
| [#673](https://github.com/Primitive-Labs/js-bao-wss/issues/673) | ✅ done | `c3cb4c4f` | `DocumentInfo.lastModified` (decodes `modifiedAt`) (CLOSED) |
| [#846](https://github.com/Primitive-Labs/js-bao-wss/issues/846) | ⚪ stale → close | — | `getOrCreateWithAlias` already exists (typed `c3cb4c4f`); GH comment posted |
| [#847](https://github.com/Primitive-Labs/js-bao-wss/issues/847) | ⚪ stale → close | — | `me.owned/sharedDocuments` exist; real gap is #938; GH comment posted |
| [#852](https://github.com/Primitive-Labs/js-bao-wss/issues/852) | 🔴 skipped | — | issue CLOSED; `client.createDocument` already provides local-first. Routing the sub-API is low-value — not doing |
| [#854](https://github.com/Primitive-Labs/js-bao-wss/issues/854) | ❓ needs decision | — | model-level subscription events — part of the model-surface call (#923 overlap) |
| [#859](https://github.com/Primitive-Labs/js-bao-wss/issues/859) | 🔴 skipped | — | a deprecation-*removal* task (remove `documents.list`), not a parity fix — not ours |
| [#928](https://github.com/Primitive-Labs/js-bao-wss/issues/928) | 🔵 deferred (scope) | — | native Google sign-in — separate native track |
| [#929](https://github.com/Primitive-Labs/js-bao-wss/issues/929) | 🔵 deferred (scope) | — | native passkeys — separate native track |
| [#930](https://github.com/Primitive-Labs/js-bao-wss/issues/930) | 🔵 deferred (scope) | — | notifications/APNS — native proposal |
| [#931](https://github.com/Primitive-Labs/js-bao-wss/issues/931) | 🔵 deferred (scope) | — | deep-link routing — native proposal |
| [#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938) | 🟡 partial | `13f0c031` | typed ✅. Remaining: offline-first cache-merge = 🔵 deferred |
| [#944](https://github.com/Primitive-Labs/js-bao-wss/issues/944) | 🔵 deferred | — | codegen TOML filenames (in the codegen tool, separate from client typing) |
| [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946) | ❓ needs decision | — | `query()` paged result — model-surface, overlaps in-flight PR #923 |
| [#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947) | ❓ needs decision | — | writes need `in: docId` — model-surface, #923 overlap |
| [#949](https://github.com/Primitive-Labs/js-bao-wss/issues/949) | 🔴 skipped | — | a JS-side public-type fix (`DatabaseChangeEvent`) — nothing to change in Swift |
| [#951](https://github.com/Primitive-Labs/js-bao-wss/issues/951) | ❓ needs decision | — | should Swift add a `client.analytics.*` namespace? |
| [#952](https://github.com/Primitive-Labs/js-bao-wss/issues/952) | 🔵 deferred | — | `databases.subscribe()` — WS feature to build |
| [#953](https://github.com/Primitive-Labs/js-bao-wss/issues/953) | ⚪ stale → close | — | `getAcceptToken` in neither client; GH close-rec posted |
| [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954) | 🟡 partial | `c3cb4c4f`…`ea7c67ca` | **19 surfaces typed ✅** (incl. prompts + doc-blob context). Remaining: analytics/auth typedness = ❓; model-surface = ❓ |
| [#955](https://github.com/Primitive-Labs/js-bao-wss/issues/955) | ❓ needs decision | — | `TypedModel` divergence — model-surface, #923 overlap |
| [#956](https://github.com/Primitive-Labs/js-bao-wss/issues/956) | ✅ done | `60db2ecd` | `workflows.runSync` |
| [#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957) | 🟡 partial | `ea7c67ca` | doc-blob context typed ✅; `prefetch`/`read(as:)` methods = 🔵 deferred (features) |
| [#958](https://github.com/Primitive-Labs/js-bao-wss/issues/958) | ✅ done | `f0576fa1` | `IntegrationCallRequest` query/method/path |
| [#959](https://github.com/Primitive-Labs/js-bao-wss/issues/959) | ✅ done | `0b7b4bc5` | error enum `WORKFLOW_APPLY_NOT_CONFIRMED` |
| [#960](https://github.com/Primitive-Labs/js-bao-wss/issues/960) | ✅ done | `0b7b4bc5` | `listUserMemberships(groupType:)` filter |
| [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961) | ✅ done | `b5e31ff2` | `close→{evicted}`, delete/removePermission eviction (sync predicates by-design) |
| [#962](https://github.com/Primitive-Labs/js-bao-wss/issues/962) | ✅ done | `0b7b4bc5`,`f0576fa1`,`ea7c67ca` | `list(databaseType:)`, manager shapes, **and `importCsv`** (the JS model-class field-filtering / `syncIndexes` path isn't ported — Swift requires explicit `types`) |
| [#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963) | ❓ needs decision | — | analytics auto-event engine — rides on the #951 namespace decision |
| [#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964) | ❓ needs decision | — | how far does auth parity go (`AUTH_CODES`, option surfaces)? passkeys are #929 (deferred, native) |
| [#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965) | 🟡 partial | `f0576fa1`,`ea7c67ca` | blob-buckets + doc-blob context typed ✅. Remaining: doc-blob delete-eviction + `prefetch` = 🔵 deferred (see #957) |
| [#991](https://github.com/Primitive-Labs/js-bao-wss/issues/991) 🆕 | 🟡 partial | `13f0c031`,`5e0b76e2`,`ea7c67ca` | silent `?? [:]` coercion gone in every typed surface incl. prompts ✅. Remaining: analytics/auth (❓ decision) |
| [#992](https://github.com/Primitive-Labs/js-bao-wss/issues/992) 🆕 | ❓ needs decision | — | `find`/`findAll` sync silent-drop — model-surface, #923 overlap |
| [#993](https://github.com/Primitive-Labs/js-bao-wss/issues/993) 🆕 | ✅ done | `f0576fa1`,`ea7c67ca` | integrations + prompts `list`/`get` typed + flagged Swift-only/runtime-broken (the dead routes are a server concern) |
| [#994](https://github.com/Primitive-Labs/js-bao-wss/issues/994) 🆕 | ✅ done | `e4591a3f`,`60db2ecd`,`ea7c67ca` | `fetchHttp` query+body, `serverTimeoutMs`, **and `waitForLoad`/offline gating** all honored (key-portability typedness rolls up under #954) |
| [#995](https://github.com/Primitive-Labs/js-bao-wss/issues/995) 🆕 | 🟡 partial | `ea7c67ca` | codegen `enum` + `auto_stamp` now supported. Remaining: `--check`/strict, relationship accessors, registration barrel, class-name derivation = 🔵 deferred |
| [#996](https://github.com/Primitive-Labs/js-bao-wss/issues/996) 🆕 | 🔵 deferred | — | event-payload divergences (touches shared `Events.swift` + emit sites) |

## Surfaces typed (#954)
**✅ Typed (19):** documents · session · users · gemini · llm · databaseTypeConfigs · collectionTypeConfigs · groupTypeConfigs · me · invitations · ruleSets · cronTriggers · groups · collections · databases · blobBuckets · integrations · workflows · **prompts** — plus the document-blob context.

**Not yet typed:** `analytics`·`auth` (❓ needs decision — namespace/scope) · model-surface (❓ #923 overlap). (Cache typedness rolls up under #954/#994; behavior is done.)

## GitHub actions taken
- **Fix comments:** [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954#issuecomment-4616843403), [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961#issuecomment-4616843520).
- **Close-recommendations:** [#846](https://github.com/Primitive-Labs/js-bao-wss/issues/846#issuecomment-4616843626), [#847](https://github.com/Primitive-Labs/js-bao-wss/issues/847#issuecomment-4616843740), [#953](https://github.com/Primitive-Labs/js-bao-wss/issues/953#issuecomment-4616843834).
- **New issues filed:** #991–#996.

## Non-code follow-ups (tracked in `user-facing-docs-todos.md`)
- Client **test target** migration (library builds clean; tests still call old untyped signatures — needed before `swift test`).
- User-facing **`docs/getting-started/` + `guides/latest/`** migration to the typed API.

## Commit reference (`js-parity-jun-3`)
`c3cb4c4f` documents typed · `b5e31ff2` documents behavioral (#961/#506) · `0b7b4bc5` bounded (#959/#960/#962) · `5c0333f3` wave-1 · `13f0c031` wave-2 · `f0576fa1` wave-3 · `5e0b76e2` wave-4 · `e4591a3f` cache query/body · `60db2ecd` cache serverTimeoutMs + runSync · `ea7c67ca` wave-5 (prompts/doc-blob/importCsv/cache-options/codegen)
