# Swift ↔ JS parity tracker (branch `docs-parity-jun-3` / `js-parity-jun-3`)

Maps every documented JS↔Swift divergence to its GitHub issue (if any), our
current status, and the planned GitHub action. Divergences are drawn from the
typed/behavioral fixes plus the dev-docs cookbook marking passes (which compare
each `.ts`↔`.swift` snippet directly, so some have no issue yet).

- **Code fixes** live on `js-bao-wss` branch `js-parity-jun-3`.
- **Doc marking** lives on `primitive-docs` branch `docs-parity-jun-3` (`dev-docs/`).
- Issue states verified against GitHub on 2026-06-03.

Legend: ✅ fixed · 📝 documented-only (code pending) · 🟦 by-design/deferred ·
⚪ stale→close · ➕ needs a new issue.

## ✅ Fixed in `js-parity-jun-3` — comment on the issue with the fix
| Issue | State | Fix shipped on the branch |
|---|---|---|
| [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954) | OPEN | **`DocumentsAPI` fully typed** (untyped `[String:Any]` → named models): new `JSONValue`/`Updatable`/`JSONCoding` foundation, `DocumentTypes.swift`. Umbrella still open for the other ~13 surfaces. |
| [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961) | OPEN | `close` → `CloseDocumentResult { evicted }` with a sync-state guard; `delete` evicts + emits `documentMetadataChanged("deleted")` + 404/offline fallback; `removePermission(userId:)` self-eviction. Predicates **kept sync-local by design** (async = `waitFor*`). |
| [#506](https://github.com/Primitive-Labs/js-bao-wss/issues/506) | CLOSED | `listGroupPermissions(includeSystem:)` — excludes `_`-prefixed platform groups by default. (Issue already closed; implemented to match.) |

Also added four manager-backed `DocumentsAPI` methods: `openAlias`, `isReadOnly`, `listOpen`, `isSynced`.

## ⚪ Stale / invalid → comment recommending close
| Issue | State | Why |
|---|---|---|
| [#846](https://github.com/Primitive-Labs/js-bao-wss/issues/846) | OPEN | `getOrCreateWithAlias` **exists** on Swift `DocumentsAPI` (now typed). |
| [#847](https://github.com/Primitive-Labs/js-bao-wss/issues/847) | OPEN | `me.ownedDocuments()`/`sharedDocuments()` **exist**; the real gap is their shape — tracked as #938. |
| [#953](https://github.com/Primitive-Labs/js-bao-wss/issues/953) | OPEN | `invitations.getAcceptToken` is in **neither** client; use `invitations.get`. |

## 📝 Documented in the cookbook, code not yet changed — comment "verified + documented; implementation pending"
| Issue | Surface | Gap |
|---|---|---|
| [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954) (rest) | analytics, databases, blob-buckets, me, groups, integrations, collections, *type-configs, rule-sets, session, … | untyped `[String:Any]` everywhere outside documents |
| [#946](https://github.com/Primitive-Labs/js-bao-wss/issues/946) | model/query | `query()` returns `[T]`, not a paged result |
| [#947](https://github.com/Primitive-Labs/js-bao-wss/issues/947) | model/write | writes need explicit `in: docId` |
| [#955](https://github.com/Primitive-Labs/js-bao-wss/issues/955) | model | `TypedModel` advanced ops on `.dynamic`; `query` → `[T]` |
| [#944](https://github.com/Primitive-Labs/js-bao-wss/issues/944) | codegen | TOML filenames diverge |
| [#951](https://github.com/Primitive-Labs/js-bao-wss/issues/951) | analytics | no `client.analytics` namespace |
| [#963](https://github.com/Primitive-Labs/js-bao-wss/issues/963) | analytics | no `analyticsAutoEvents`; untyped `logAnalyticsEvent` |
| [#952](https://github.com/Primitive-Labs/js-bao-wss/issues/952) | databases | `subscribe()` is JS-only |
| [#962](https://github.com/Primitive-Labs/js-bao-wss/issues/962) | databases | `importCsv` / `list()` options / manager shapes |
| [#949](https://github.com/Primitive-Labs/js-bao-wss/issues/949) | databases | `changeType` missing from public `DatabaseChangeEvent` |
| [#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957) | document-blob | `prefetch`, accessor, `read(as:)` |
| [#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965) | document-blob / buckets | missing JS surface; untyped bucket admin |
| [#958](https://github.com/Primitive-Labs/js-bao-wss/issues/958) | integrations | `IntegrationCallRequest` query/method/path drift |
| [#959](https://github.com/Primitive-Labs/js-bao-wss/issues/959) | errors | enum missing `WORKFLOW_APPLY_NOT_CONFIRMED` |
| [#960](https://github.com/Primitive-Labs/js-bao-wss/issues/960) | groups | `listUserMemberships` missing `{groupType}` |
| [#964](https://github.com/Primitive-Labs/js-bao-wss/issues/964) | auth | passkeys; OAuth/magic-link/OTP/logout surfaces; `AUTH_CODES` |
| [#938](https://github.com/Primitive-Labs/js-bao-wss/issues/938) | me | `owned/sharedDocuments` shape (bare GET vs offline-first) |
| [#854](https://github.com/Primitive-Labs/js-bao-wss/issues/854) | model | model-level subscription events for `BaoDataLoader` |
| [#590](https://github.com/Primitive-Labs/js-bao-wss/issues/590) | group-type-configs | `groupType` not percent-encoded on get/update/delete |
| [#596](https://github.com/Primitive-Labs/js-bao-wss/issues/596) | collection-type-configs | `collectionType` percent-encoding path divergence |

## 🟦 By-design / deferred (no action, or already-closed issue)
- inSync/includesWrites sync-local (async = `waitFor*`); `getDocumentPermission` typed enum; `getLocalMetadata` sync (SQLite vs IndexedDB) — by design (#961 / #954).
- Local-first `create` + `commitOfflineCreate` — [#852](https://github.com/Primitive-Labs/js-bao-wss/issues/852) (CLOSED); deferred.
- `documents.list` pagination — deferred; `list` is slated for removal ([#859](https://github.com/Primitive-Labs/js-bao-wss/issues/859)).
- `open` returns `YDocument` (not `{doc, metadata}`); awareness/presence API not in v1 — deferred, no issue.
- Benign: removePermission overloads, waitForWriteConfirmation throws-vs-bool, evict/evictAll/cancelPendingCreate no-options, getOwner (Swift-only), listPendingCreates `[String]`, me.cacheInfo tuple, errors enum-vs-string, blob `download` `Data` vs `ArrayBuffer`, KvCache (Swift-only), service-worker (web-only).

## ➕ New issues filed (surfaced by the direct-diff pass — had no existing issue)
Filed 2026-06-03, all labelled `ios`:
| Issue | Title | Surface | Why it matters |
|---|---|---|---|
| [#991](https://github.com/Primitive-Labs/js-bao-wss/issues/991) | Swift client coerces malformed/undecodable responses to empty success (`result as? [String:Any] ?? [:]`) | workflows, cron, prompts, *type-configs, … | a non-dict/error body silently reads as an empty **success** instead of throwing (JS rejects) — masks real failures |
| [#992](https://github.com/Primitive-Labs/js-bao-wss/issues/992) | Swift `Model.find`/`findAll` are synchronous and silently drop typed-decode misses | model surface | `find` returns `nil` on a decode miss (indistinguishable from not-found); `findAll` under-reports — data-loss-shaped, and sync vs JS async |
| [#993](https://github.com/Primitive-Labs/js-bao-wss/issues/993) | Swift `prompts.get`/`prompts.list` and `integrations.list`/`get` hit non-existent app-api routes | prompts, integrations | Swift-only methods that JS doesn't have and that 404 at runtime |
| [#994](https://github.com/Primitive-Labs/js-bao-wss/issues/994) | Swift `cache.fetchHttp` drops `query` (wrong cache hits); `fetchCached` options are silent no-ops; cache keys not portable | cache | correctness bug (P0-ish): wrong cached results; documented options silently ignored |
| [#995](https://github.com/Primitive-Labs/js-bao-wss/issues/995) | Swift codegen parity gaps beyond filenames (#944): `enum`, `auto_stamp`, class-name derivation, `--check`, relationship accessors, registration barrel | codegen | generated Swift silently omits validated TOML features the JS codegen honors |
| [#996](https://github.com/Primitive-Labs/js-bao-wss/issues/996) | Swift client event payloads diverge from JS (field drops/renames; `source` vocabulary+optionality; `permission` enum-vs-string; awareness snapshot-vs-delta) | events | subscribers can't rely on the same payload shape/fields across clients |

> Blob-delete local-cleanup gap and downloadUrl `attachmentFilename` were folded into #965 rather than filed separately.

## GitHub actions taken (2026-06-03)
- **Fix comments:** [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954#issuecomment-4616843403), [#961](https://github.com/Primitive-Labs/js-bao-wss/issues/961#issuecomment-4616843520).
- **Close-recommendations (stale/invalid):** [#846](https://github.com/Primitive-Labs/js-bao-wss/issues/846#issuecomment-4616843626), [#847](https://github.com/Primitive-Labs/js-bao-wss/issues/847#issuecomment-4616843740), [#953](https://github.com/Primitive-Labs/js-bao-wss/issues/953#issuecomment-4616843834).
- **New issues:** #991–#996 (above).
- The ~20 "documented, pending" issues were intentionally left un-commented (scope kept to fixed + stale).
