# Swift ↔ JS divergences — triage to zero

Verdict for every divergence in [`swift-parity-divergences.md`](swift-parity-divergences.md):
**✅ FIXABLE** (with a concrete approach) or **⛔ EXEMPT** (only true blockers).

**Exempt is allowed for exactly two reasons:**
1. **Platform / native** — needs native iOS frameworks or is web-only (passkeys/OAuth flow, service-worker, browser file types, `Data` vs `ArrayBuffer`, the awareness/presence subsystem).
2. **Typed-vs-dynamic idiom** — matching JS would mean reverting a typed Swift struct/enum back to an untyped `[String: Any]` / dynamic inline object (that's the whole point of the typed client). These are *not* capability gaps.

**Totals: ~61 ✅ fixable · ~28 ⛔ exempt.**

> **One decision for you** (the "fixable-by-removal" rows below): a chunk of the
> divergences are **Swift-only *additive* helpers** — Swift has *more* than JS.
> "Matching" them means **deleting useful API**. They're flagged
> `✅ FIXABLE (by removal)`. Tell me: **keep them** (accept as additive, not gaps)
> or **remove them** for strict zero-divergence?

---

## Genuine fixes (do these — no capability loss)

### auth / me / groups
| Section | Flag | Fix |
|---|---|---|
| auth · `enableOfflineAccess` | 🔴 | Add `preferBiometric`/`allowPinFallback`/`retention`/`pinProvider`; flip the inverted biometric default to JS's opt-in |
| auth · `logout` | 🔴 | Wire the already-declared `revokeOffline`/`clearOfflineIdentity` (only `wipeLocal` is honored) + add `waitForDisconnect` (`redirectTo` is web-only) |
| auth · `exchangeOAuthCode` | 🟢 | Wrap named args in a params struct + add `refreshProxyBaseUrl`/`refreshProxyCookieMaxAgeSeconds` |
| auth · `magicLinkVerify` | 🟢 | Add the `inviteToken` verify option |
| me · `uploadAvatar` | 🟢 | Typed `AvatarContentType` enum (png/jpeg/gif/webp) instead of bare `String` |
| me · `ownedDocuments` | 🟢 | Add `includeRoot`/`refreshFromServer`/`localOnly`/`serverTimeoutMs`/`waitForLoad`/`forward`/`returnPage` |

### documents / blobs
| Section | Flag | Fix |
|---|---|---|
| documents · `open` / `openAlias` | 🟢 | Return `{ doc, metadata }` (an `OpenDocumentResult` struct; metadata already available) instead of bare `YDocument` |
| documents · `list` | 🟡 | Add JS's `tag`/`forward`/`waitForLoad`/`refreshFromServer`/`localOnly`/`returnPage` options |
| document-blob · `read` | 🟢 | Add the missing `disposition` option (the rest is typed-overload idiom) |

### events (payload fills)
| Section | Flag | Fix |
|---|---|---|
| events · `documentMetadataChanged` | 🟢 | Emit JS's `source` vocab (`"remote"`→`"server"`, non-optional); `idb` has no Swift analog |
| events · `blobs:upload-progress/completed/failed` | 🟢 | Add the dropped queue-record fields (`queueId`/`filename`/`contentType`/`status`/`attempts`/`retainLocal`/`updatedAt`), make `error` optional |
| events · `workflowStarted` | 🟢 | Populate the 5 fields off the server frame (`workflowId`/`runKey`/`instanceId`/`contextDocId`/`meta`) |
| events · `syncPerf` | 🟢 | Carry JS's `timings`/`clientTimings` maps |
| events · `awareness` | 🟢 | Deliver `added`/`updated`/`removed` client-id deltas (presence exists; only the delta shape differs) |

### analytics / gemini / llm / cache / errors
| Section | Flag | Fix |
|---|---|---|
| analytics · per-feature auto-events | 🟡 | Instrument the Swift call-sites (boot/dailyAuth/firstDocOpen/blobUploads/llm/gemini) + `analyticsAutoEvents` gate (`serviceWorker` is the one browser-only drop) |
| gemini · no analytics events | 🔴 | Wire an analytics context into `GeminiAPI` (fire `prompt_started/_succeeded/_failed`) |
| gemini · `generateRaw` error code | 🟢 | Change the two validation throws from `.invalidArgument` → `.geminiError` |
| llm · no analytics events | 🔴 | Wire an analytics context into `LlmAPI.chat` |
| cache · `key` not portable | 🔴 | Use JS's `base:<sorted-JSON>` key format (`.sortedKeys`) so keys match byte-for-byte |
| errors · `details` type | 🟢 | Widen `details` from `[String: String]?` to a JSON-value type (nested objects/numbers/bools) |

### model-surface / codegen
| Section | Flag | Fix |
|---|---|---|
| model-surface · `findByUnique` | 🟢 | Emit the static facade method + `findByUniqueShared` shim (`MultiDocModel.findByUnique` already exists) |
| model-surface · `queryOne` | 🟢 | Emit `static queryOne(...) -> Model?` (= `query(...).first`) |
| model-surface · `upsert` | 🟢 | Facade `save(in:upsertOn:)` over the existing `DynamicModel.upsert` |
| model-surface · `aggregate` groupBy | 🔴 | Widen facade `groupBy: [String]` to the membership-capable `DoDbGroupBy` shape |
| codegen · filename | 🟡 | Make the SPM plugin also accept `models.toml` (JS's name) |
| codegen · strict unknown-key | 🟢 | Add an unknown-key rejection pass + `--no-strict` flag |
| codegen · registration barrel | 🟢 | Make `GeneratedModels.register(on:)` assert TOML-set == generated-set |

---

## Fixable-by-removal — **your call: keep (additive) or remove (strict parity)?**

Swift has these; JS does **not**. They're extra capability, not gaps.

| Section | What | Note |
|---|---|---|
| prompts · `get` / `list` | 🔴 dead routes (404, #993) | **Remove regardless** — they're broken, JS prompts = `execute`-only |
| integrations · `list` / `get` | 🔴 dead routes (#993) | **Remove regardless** — broken, JS integrations = `call`-only |
| prompts · positional `execute` overload | 🟢 | Swift-only convenience overload |
| workflows · `normalizedStatus` field | 🟢 | Swift-only reconciliation field |
| workflows · `runAndApply`/`awaitRun`/`recheckPendingRuns`/`deliverPendingApplies`/`undefine` | 🟡 | Swift-only orchestration helpers |
| documents · `getOwner` | 🟡 | Swift-only convenience over `get().createdBy` |
| cache · `KvCache.get`/`set` | 🟡 | Swift-only direct cache access |
| errors · `UNSYNCED_CHANGES` | — | Swift-only error code (JS throws a plain Error) |

---

## ⛔ Exempt — true blockers only

### Platform / native
| Section | Reason |
|---|---|
| auth · `startOAuthFlow` (#928) | Native OAuth presentation vs web redirect |
| auth · Passkeys (#929) | Needs iOS `AuthenticationServices` |
| documents · `setAwareness`/`getAwarenessStates`/`removeAwareness` | The live presence/awareness WS subsystem — sizeable native effort, absent in v1 |
| document-blob · `upload` source | JS `File`/`Blob`/`Uint8Array` browser types; Swift takes `Data` + explicit name/type |
| document-blob · `proxyUrl`/`hasServiceWorkerControl` | Browser service worker; no native counterpart |
| blob-buckets · `download` | `Data` vs `ArrayBuffer` — platform raw-bytes type |

### Typed-vs-dynamic idiom (not capability gaps — matching = de-typing)
| Section | Reason |
|---|---|
| analytics · `logEvent` | Typed `AnalyticsEventInput` vs inline object |
| cache · `info`, me · `cacheInfo` | Typed tuple vs `{}` object |
| errors · duck-type check / code-match | Typed `isJsBaoError` + enum `.code` vs JS string/structural |
| documents · `removePermission`, `getDocumentPermission` | Typed overloads / enum vs JS string-union |
| groups · `addMember`, `removeMemberByEmail` | Typed factories / split methods vs JS string-union |
| databases · `connect`/`DoDb` | `modelName:` string addressing vs JS class-bound `db.User.*` |
| model-surface · static facade, `save(in:)`, `find`/`findAll`/`count` | Static struct facade + explicit doc id + sync local reads — the deliberate Swift store design |
| workflows · `listRuns` | `ListWorkflowRunsOptions` already mirrors the JS inline object 1:1 |
| events · `permission` | Typed `DocumentPermission` enum vs JS string |

---

## Already fixed (stale catalog rows — just update the note)
- auth · `getAppConfig` — Swift returns typed `AuthConfigInfo` (superset).
- model-surface · `queryPaged` / cursor pagination — already emitted (`PagedQueryResult`).
- errors · `WORKFLOW_APPLY_NOT_CONFIRMED` — present in the enum.
- document-blob · app-wide upload-queue — already at parity.
- documents · the six deprecated invitation methods — all present + `@deprecated` in Swift.
