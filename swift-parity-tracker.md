# Swift ↔ JS parity — status chart

Single source of truth for what's addressed vs. not. Client fixes are on
`js-bao-wss` branch **`js-parity-jun-3`**; docs on `primitive-docs` branch
`docs-parity-jun-3`. Commit hashes below are short SHAs on `js-parity-jun-3`.
Last updated 2026-06-04.

**Status legend:** ✅ done · 🟡 partial · ⏸️ deferred · ⛔ out-of-scope/by-design · ⚪ stale/invalid → close · 🆕 filed by us (not started)

## Master chart

| Issue | Status | Fix commit | What / reason |
|---|---|---|---|
| [#453](https://github.com/Primitive-Labs/js-bao-wss/issues/453) | ✅ done | `f0576fa1` | groups `addMember` discriminated-union result |
| [#506](https://github.com/Primitive-Labs/js-bao-wss/issues/506) | ✅ done | `b5e31ff2` | `listGroupPermissions(includeSystem:)` (issue already CLOSED) |
| [#590](https://github.com/Primitive-Labs/js-bao-wss/issues/590) | ✅ done | `5c0333f3` | `groupType` percent-encoding (group-type-configs) |
| [#596](https://github.com/Primitive-Labs/js-bao-wss/issues/596) | ✅ done | `5c0333f3` | `collectionType` percent-encoding |
| [#673](https://github.com/Primitive-Labs/js-bao-wss/issues/673) | ✅ done | `c3cb4c4f` | `DocumentInfo.lastModified` (decodes `modifiedAt`) (CLOSED) |
| [#846](https://github.com/Primitive-Labs/js-bao-wss/issues/846) | ⚪ close | — | `getOrCreateWithAlias` already exists (typed `c3cb4c4f`); GH comment posted |
| [#847](https://github.com/Primitive-Labs/js-bao-wss/issues/847) | ⚪ close | — | `me.owned/sharedDocuments` exist; real gap is #938; GH comment posted |
| [#852](https://github.com/Primitive-Labs/js-bao-wss/issues/852) | ⏸️ deferred | — | local-first `create`/`commitOfflineCreate`; flow exists via `client.createDocument` (issue CLOSED) |
| [#854](https://github.com/Primitive-Labs/js-bao-wss/issues/854) | ⏸️ deferred | — | model-level subscription events (model-surface tier) |
| [#859](https://github.com/Primitive-Labs/js-bao-wss/issues/859) | ⏸️ deferred | — | remove deprecated `documents.list` (a removal task; we kept it typed) |
| [#928](https://github.com/Primitive-Labs/js-bao-wss/issues/928) | ⛔ deferred (scope) | — | native Google sign-in — native feature, separate track |
| [#929](https://github.com/Primitive-Labs/js-bao-wss/issues/929) | ⛔ deferred (scope) | — | native passkeys — native feature, separate track |
| [#930](https://github.com/Primitive-Labs/js-bao-wss/issues/930) | ⛔ deferred (scope) | — | notifications/APNS — native proposal |
| [#931](https://github.com/Primitive-Labs/js-bao-wss/issues/931) | ⛔ deferred (scope) | — | deep-link routing — native proposal |
| [#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938) | 🟡 partial | `13f0c031` | `me.owned/sharedDocuments` **typed**; offline-first behavior deferred |
| [#944](https://github.com/Primitive-Labs/js-bao-wss/issues/944) | ⏸️ deferred | — | codegen TOML filenames (codegen tooling; documented only) |
| [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946) | ⏸️ deferred | — | `query()` should return a paged result (model-surface, architectural) |
| [#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947) | ⏸️ deferred | — | writes need explicit `in: docId` (model-surface) |
| [#949](https://github.com/Primitive-Labs/js-bao-wss/issues/949) | ⏸️ deferred | — | `changeType` on public `DatabaseChangeEvent` (JS-side; documented) |
| [#951](https://github.com/Primitive-Labs/js-bao-wss/issues/951) | ⏸️ deferred | — | `client.analytics` namespace — **needs design decision** |
| [#952](https://github.com/Primitive-Labs/js-bao-wss/issues/952) | ⏸️ deferred | — | `databases.subscribe()` — WS feature to build |
| [#953](https://github.com/Primitive-Labs/js-bao-wss/issues/953) | ⚪ invalid | — | `getAcceptToken` in neither client; GH comment to close |
| [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954) | 🟡 mostly done | `c3cb4c4f`,`5c0333f3`,`13f0c031`,`f0576fa1`,`5e0b76e2` | **18 surfaces typed**; NOT yet: **prompts**, analytics, auth, cache, document-blob context |
| [#955](https://github.com/Primitive-Labs/js-bao-wss/issues/955) | ⏸️ deferred | — | `TypedModel` divergence (model-surface) |
| [#956](https://github.com/Primitive-Labs/js-bao-wss/issues/956) | ✅ done | `60db2ecd` | `workflows.runSync` |
| [#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957) | ⏸️ deferred | — | document-blob `prefetch`/`read(as:)` (DocumentBlobContext still untyped) |
| [#958](https://github.com/Primitive-Labs/js-bao-wss/issues/958) | ✅ done | `f0576fa1` | `IntegrationCallRequest` query/method/path |
| [#959](https://github.com/Primitive-Labs/js-bao-wss/issues/959) | ✅ done | `0b7b4bc5` | error enum `WORKFLOW_APPLY_NOT_CONFIRMED` |
| [#960](https://github.com/Primitive-Labs/js-bao-wss/issues/960) | ✅ done | `0b7b4bc5` | `listUserMemberships(groupType:)` filter |
| [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961) | ✅ done | `b5e31ff2` | `close→{evicted}`, delete/removePermission eviction (sync predicates by-design) |
| [#962](https://github.com/Primitive-Labs/js-bao-wss/issues/962) | 🟡 partial | `0b7b4bc5`,`f0576fa1` | `list(databaseType:)` + manager shapes typed; `importCsv` (#962a) deferred |
| [#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963) | ⏸️ deferred | — | analytics auto-event firing engine (feature) |
| [#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964) | ⏸️ deferred | — | auth option surfaces / `AUTH_CODES`; passkeys native (#929, scope) |
| [#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965) | 🟡 partial | `f0576fa1` | blob-buckets typed; document-blob context surface deferred |
| [#991](https://github.com/Primitive-Labs/js-bao-wss/issues/991) 🆕 | 🟡 partial | `13f0c031`,`5e0b76e2` | silent `?? [:]` coercion removed in cron/workflows + every typed surface; analytics/auth/cache/**prompts** remain |
| [#992](https://github.com/Primitive-Labs/js-bao-wss/issues/992) 🆕 | ⏸️ deferred | — | `find`/`findAll` sync silent-drop (model-surface) |
| [#993](https://github.com/Primitive-Labs/js-bao-wss/issues/993) 🆕 | 🟡 partial | `f0576fa1` | integrations `list`/`get` kept + flagged; **prompts** routes not yet addressed |
| [#994](https://github.com/Primitive-Labs/js-bao-wss/issues/994) 🆕 | 🟡 partial | `e4591a3f`,`60db2ecd` | `fetchHttp` query+body and `serverTimeoutMs` done; `waitForLoad`/offline deferred |
| [#995](https://github.com/Primitive-Labs/js-bao-wss/issues/995) 🆕 | 🆕 not started | — | codegen gaps beyond filenames |
| [#996](https://github.com/Primitive-Labs/js-bao-wss/issues/996) 🆕 | 🆕 not started | — | event-payload divergences |

## Surfaces typed (#954)
**✅ Typed (18):** documents · session · users · gemini · llm · databaseTypeConfigs · collectionTypeConfigs · groupTypeConfigs · me · invitations · ruleSets · cronTriggers · groups · collections · databases · blobBuckets · integrations · workflows

**❌ Not yet typed:**
- **prompts** — the one remaining dedicated API file (clean, quick follow-up).
- **analytics · auth · cache** — not standalone API files; live in `JsBaoClient.swift` / `Internal/` and are tied to feature issues (#951/#963, #964, #994).
- **document-blob context** (`DocumentBlobContext` inside `DocumentsAPI.swift`) — #957/#965.
- **model-surface** (`Schema/`) — architectural, #946/#947/#955/#992.

## GitHub actions taken
- **Fix comments:** [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954#issuecomment-4616843403), [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961#issuecomment-4616843520).
- **Close-recommendations:** [#846](https://github.com/Primitive-Labs/js-bao-wss/issues/846#issuecomment-4616843626), [#847](https://github.com/Primitive-Labs/js-bao-wss/issues/847#issuecomment-4616843740), [#953](https://github.com/Primitive-Labs/js-bao-wss/issues/953#issuecomment-4616843834).
- **New issues filed:** #991–#996.

## Non-code follow-ups (tracked in `user-facing-docs-todos.md`)
- Client **test target** migration (the library builds clean; tests still call old untyped signatures — needed before `swift test`).
- User-facing **`docs/getting-started/` + `guides/latest/`** migration to the typed API.

## Commit reference (`js-parity-jun-3`)
`c3cb4c4f` documents typed · `b5e31ff2` documents behavioral (#961/#506) · `0b7b4bc5` bounded (#959/#960/#962) · `5c0333f3` wave-1 · `13f0c031` wave-2 · `f0576fa1` wave-3 · `5e0b76e2` wave-4 (workflows) · `e4591a3f` cache query/body · `60db2ecd` cache serverTimeoutMs + runSync
