# Swift Client Parity ↔ Docs Crosswalk

_Every JS↔Swift parity-sweep finding, mapped to whether the docs cover it, where, and what aligning Swift would fix._

**Sources**
- Parity sweep: `js-bao-wss/swift-client/docs/parity/sweep/` — baseline run `da751474` (2026-06-03), 27 surfaces, ~121 drafted findings (drafts only, nothing filed).
- Docs checked: `primitive-docs` — `docs/getting-started/*.md`, `examples/**`, `guides/latest/*`.
- Cross-refs: open `Primitive-Labs/js-bao-wss` issues (#938, #946, #952, #954, #956, #957, #960, #962, …).

**This is an analysis artifact — no docs were edited to produce it.**

## How to read the "In docs?" column

| Mark | Meaning | Why it matters |
|---|---|---|
| ❌ | **Not documented** — the method/behavior appears nowhere in docs/examples/guides | A Swift gap no reader would ever discover from the docs |
| ⚠️ | **Documented, drift NOT called out** — the doc shows it, but silently presents the divergent/wrong Swift shape, or omits the gap | The dangerous class: the docs *look* fine but mislead |
| ✅ | **Documented + caveated** — the doc already flags the JS↔Swift difference | Working as intended; aligning Swift lets the caveat be removed |

## Summary

| Group (surfaces) | Rows | ❌ | ⚠️ | ✅ |
|---|--:|--:|--:|--:|
| documents (documents, document-blob, model-surface) | 25 | 6 | 12 | 7 |
| databases (databases, *TypeConfigs, collections) | 18 | 12 | 4 | 2 |
| people (me, users, groups, groupTypeConfigs) | 18 | 5 | 11 | 2 |
| invitations / sharing | 4 | 0 | 4 | 0 |
| auth | 9 (+2 exempt) | 3 | 2 | 4 |
| blobBuckets | 5 | 1 | 4 | 0 |
| automation (workflows, prompts, integrations, cron) | 15 | 5 | 9 | 1 |
| analytics / events / errors | 15 | 6 | 9 | 0 |
| infra (gemini, llm, cache, codegen, ruleSets, session) | 28 | 16 | 12 | 0 |
| **Total** | **~137** | **54** | **67** | **16** |

**The takeaway for your three questions:**
- **What's documented:** the core CRUD/query/sharing/blob/workflow happy-paths — and they have Swift examples.
- **What's missing in Swift:** ~54 things have no doc footprint at all (whole namespaces `gemini`/`llm`/`cache`, the `databases.connect()`/`DoDb` record API, most `*TypeConfigs`, auth offline-access, analytics auto-events).
- **What to do about it:** the ⚠️ rows are the priority — **67 places where the docs silently show the divergent Swift shape.** These mislead readers today. The sharpest are below.

## Highlights — docs that actively contradict the Swift client (fix-first)

1. **`me.ownedDocuments()` "cache-backed and offline-aware"** (Swift guide ~line 209) — Swift is a bare GET (me D4 / #938). Doc states the opposite.
2. **Analytics auto-events (P0)** — `analytics.md:7-26` + Swift guide say lifecycle events fire "automatically… all enabled by default"; Swift emits **zero** client-side auto events (analytics D4). Silent product-analytics blackout on iOS.
3. **`swift-client.md` "full sub-API parity… params and events match"** blanket claim (~line 79) — contradicted by nearly every ⚠️ row below.
4. **`cache.fetchHttp` / `FetchCachedOptions`** — docs advertise `waitForLoad`/`serverTimeoutMs`/`query` as working; Swift silently ignores them (cache D1 P0 wrong-results, D8).
5. **`databases.connect()` record API** — Swift agent guide ships JS-only `connect(...)` code with **no JS-only banner** (databases D2), unlike `subscribe`/`importCsv` which are properly caveated.
6. **Two outright doc bugs on sharing** — `invitations.getAcceptToken` (exists in neither client; should be `invitations.get`) and `denyAccessRequest({reason})` (`reason` is not a real param).

---

# 1. Documents

## documents — docs page(s): working-with-documents.md, swift-client.md, sharing-and-invitations.md; guide AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.swift.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — DocumentsAPI almost entirely untyped `[String: Any]` in/out (vs named JS interfaces); same as #954 | typedness · P1 | ⚠️ Documented, drift NOT called out | swift-client.md:445-448 ("Loose return types" warning, generic); shown untyped in examples/documents/create-document.swift, list-owned.swift, share-document.swift | Global "loose return types" warning could be narrowed/removed; share-document.swift & list-owned.swift become typed (not raw-dict casts) |
| D2 — `documents.create` returns `[String: Any]`, POSTs raw dict, not local-first/typed (vs JS `{metadata}` from `CreateDocumentOptions`, local-first); cf. closed #852 | return-shape + param/options + behavioral · P1 | ⚠️ Documented, drift NOT called out | examples/documents/create-document.swift (passes `["title":..., "tags":...]` dict, reads `result["metadata"]`); contrast create-document.ts typed `{title,tags}` | create-document.swift becomes a true dual of the .ts (typed `CreateDocumentOptions`, typed metadata return) |
| D3 — `documents.list` untyped `[String: Any]`, missing `tag`/`forward`/`waitForLoad`/`refreshFromServer`/`localOnly`/`returnPage`/array-vs-page duality; cf. #848(closed), #938/#946 | return-shape + param/options + behavioral · P1 | ⚠️ Documented, drift NOT called out | guide DOCUMENTS.swift.md:148 (`list()` deprecated, steers to `me.owned/sharedDocuments`); examples/sharing/list-my-documents.ts:9-10 shows full JS option set; Swift envelope-as-`[String:Any]` at guide:132, examples/documents/list-owned.swift | n/a — `list` is deprecated in docs; gap mostly redirected to `me.ownedDocuments`/`sharedDocuments` (their own envelope drift is #938/#946) |
| D4 — `documents.delete` returns `[String: Any]`, no local eviction / `documentMetadataChanged` / offline-pending-404 fallback (vs JS `void` + reconciliation); cf. #961 | return-shape + behavioral · P1 | ⚠️ Documented, drift NOT called out | examples/documents/delete-document.swift (`_ = try await ...delete`, return ignored, no eviction/event shown) | delete-document.swift loses the discarded `_ =` return; offline/eviction behavior becomes describable as dual |
| D5 — `documents.removePermission` returns `[String: Any]`, split overloads, no self-removal local eviction (vs JS `void`, string/`{userId}`/`{email}` union); cf. #954/#961 | return-shape + param/options + behavioral · P1 | ⚠️ Documented, drift NOT called out | sharing-and-invitations.md:453,457 (JS-only, shows union form); guide DOCUMENTS.swift.md:1325-1326 (JS-only, ".swift" guide carries only JS calls) | removePermission examples become dual-able (Swift shown); self-removal eviction caveat could be stated |
| D6 — Swift `update`/`addTag`/`removeTag` skip optimistic local-cache write + root-doc guard on `update` (vs JS); cf. #947 | behavioral · P1 | ❌ Not documented | — (update-metadata.swift shows the PUT but neither the root-doc guard nor optimistic-cache behavior is mentioned anywhere) | n/a — internal/advanced (optimistic-cache + root guard are behavioral, not a shown API shape) |
| D7 — Swift `DocumentInfo` struct diverges: `modifiedAt` vs JS `lastModified`, missing `thumbnailBlobId`/`metadata`/`invitationAccepted`/`upgradedFromPermission`/`grantedAt`, extra `tenantScopedDO`; cf. #954, #673 | typedness + naming + return-shape · P1 | ⚠️ Documented, drift NOT called out | guide DOCUMENTS.swift.md:132 documents the *fields* (`lastModified`, `thumbnailBlobId`, `metadata`) but says Swift returns them "as `[String: Any]`" — silently presents JS field names while the Swift struct renames/drops them | Field-name caveat ("Swift always returns the envelope as `[String: Any]`") disappears; docs can name the real Swift `DocumentInfo` fields |
| D8 — `DocumentAliasesAPI` returns untyped dicts, positional args, bare-`String` scope (vs typed `DocumentAliasInfo` + `"app"|"user"` union); cf. #954, #846(stale) | typedness + param/options · P1 | ⚠️ Documented, drift NOT called out | swift-client.md:343-345,362-363 (`getOrCreateWithAlias` shown, untyped); working-with-documents.md:171-179 (get-or-create-doc example); `aliases.resolve`/`set` mentioned swift-client.md:363, no typed shape | get-or-create / alias examples gain a typed `DocumentAliasInfo` return + `DocumentAliasScope` enum |
| D9 — `documents.listGroupPermissions` missing JS `includeSystem` option (can't surface `_col-*` internal groups); cf. #506, #954 | param/options · P2 | ❌ Not documented | — (no `includeSystem` / `_col-*` / `listGroupPermissions` mention in documents docs or guide) | n/a — internal/advanced (admin-only internal-group listing) |

## document-blob — docs page(s): blobs-and-files.md; guide AGENT_GUIDE_TO_PRIMITIVE_BLOBS.swift.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D7 — `DocumentBlobContext.list()` returns untyped `[[String: Any]]`, drops `BlobListResult`/cursor (vs JS `{items, cursor?}`); cf. #954, #965 | typedness + return-shape · P1 | ⚠️ Documented, drift NOT called out | examples/blobs/doc-blob-manage.swift (`blobs.list(limit:50)` → untyped, no cursor); swift-client.md:445-448 generic loose-types warning | doc-blob-manage.swift list becomes typed `BlobListResult` with a `cursor` (pageable); generic warning narrows |
| D8 — `DocumentBlobContext.get()` returns untyped `[String: Any]` (vs JS typed `T`/`BlobInfo`); cf. #954, #965 | typedness · P1 | ⚠️ Documented, drift NOT called out | examples/blobs/doc-blob-manage.swift (`blobs.get(blobId:)` → `meta` dict); swift-client.md:445-448 | doc-blob-manage.swift `get` returns typed `BlobInfo`; loose-types warning narrows |
| D9 — `DocumentBlobContext.delete()` returns untyped `[String: Any]` (vs JS `{deleted: boolean}`); cf. #954, #965 | typedness + return-shape · P1 | ⚠️ Documented, drift NOT called out | examples/blobs/doc-blob-manage.swift (`_ = try await blobs.delete(blobId:)`, return ignored) | delete result becomes typed `{deleted}`/`Bool` instead of discarded `_ =` |
| D10 — Swift `delete()` never evicts local cache / cancels queued upload (vs JS evict + cancel + `queue-drained`) | behavioral · P1 | ❌ Not documented | — (doc-blob-manage.swift shows delete but no cache/queue cleanup; not mentioned in blobs-and-files.md or guide) | n/a — internal/advanced (stale-read / phantom-retry behavior, not a shown shape) |
| D11 — `makeRequest` escape hatch is `Any`-typed across whole blob context (root cause of D7-D9); cf. #954 | typedness · P2 | ⚠️ Documented, drift NOT called out | swift-client.md:445-448 (generic loose-types warning is the umbrella for this) | n/a — internal/advanced (umbrella for D7-D9; fixing those removes the leak) |
| D12 — `upload()` accepts only `Data` (vs JS `File｜Blob｜Uint8Array｜ArrayBuffer`), filename auto-derivation lost; cf. #965 | param/options · P2 | ✅ Documented + caveated | blobs-and-files.md:53 ("Swift's `read(blobId:)` returns `Data`" — read side); upload-side `Data` shown in examples/blobs/doc-blob-upload.swift with explicit `filename`/`contentType`; File/Blob noted JS-only in guide BLOBS.swift.md:69 | n/a — `File`/`Blob` sources are inherently web-only; Swift `Data` + explicit options is the documented equivalent |
| D13 — upload-queue/pause-resume facade (`uploads`/`pauseUpload`/`resumeUpload`/`pauseAll`/concurrency) public in JS but absent from Swift `documents`/blob context (only on internal manager); cf. #965 | behavioral + missing-in-swift · P1 | ✅ Documented + caveated | blobs-and-files.md:71 ("JavaScript-only — the Swift document-blob context doesn't expose prefetch yet"); guide BLOBS.swift.md:69 ("`uploads()`/pause/resume ... are JS-only") + :307 "Queue management (JS-only)"; swift-client.md:455 notes `client.setBlobUploadConcurrency(4)` (global, exists on Swift) | If queue facade re-exported on Swift, the "JS-only" caveats on queue mgmt drop and pause/resume examples become dual-able |
| D14 — blob upload events: name set + payloads diverge (Swift declares unfired `blobs:upload-queued`; only emits completed/failed/queue-drained; payload fields differ); cf. #965, #949 | error/event · P2 | ✅ Documented + caveated | guide BLOBS.swift.md:330 "## Events (JS-only)" (whole event section flagged JS-only); :399 "Complete example ... (JS/web-only)" | If Swift emits the full aligned event set, the "Events (JS-only)" caveat drops and the event examples become dual-able |

## model-surface — docs page(s): working-with-documents.md, swift-client.md; guide AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.swift.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — app-facing `Model.query()` facade returns `[T]`, dropping JS `PaginatedResult` (cursors/hasMore); refresh of stale #946/#955 | return-shape · P1 | ✅ Documented + caveated | working-with-documents.md:63 ("`query()` returns a `PaginatedResult` in JavaScript ... In Swift, `query()` returns the rows directly"); guide DOCUMENTS.swift.md:658 + :224-230 (paged access routed to `tasks.dynamic.queryPaged`); examples/documents/query-paginate.swift uses `.dynamic.queryPaged` | If `query()` returned typed paged shape, the "Swift returns rows directly / use `.dynamic` for cursors" caveat drops and query-paginate becomes a clean dual of the JS facade |
| D2 — `Model.aggregate()` returns untyped `[[String: Any]]` + options-shape drift (`groupBy [String]` only, no stringset-membership, no single-facet map); cf. #954, #946 | typedness + param/options · P1 | ⚠️ Documented, drift NOT called out | examples/documents/aggregate.swift (typed `AggregateOptions` in, but result `stats` is untyped `[[String:Any]]`, discarded); guide DOCUMENTS.swift.md:820 documents `StringSetMembership` `{field,contains}` groupBy for JS only — Swift `groupBy:[String]` silently can't express it | aggregate.swift result becomes typed; `StringSetMembership` groupBy + single-facet-map become dual-able |
| D3 — active-document write defaulting unwired on Swift facade (requires explicit `in:`); tracked #947 (OPEN, accurate) | behavioral · P1 | ✅ Documented + caveated | working-with-documents.md:49 ("In single-document mode the JS save targets the active document; otherwise pass `{ targetDocument }`" — Swift writes are doc-bound via `TypedModel`); guide DOCUMENTS.swift.md (TypedModel bound to one doc) | n/a — known issue #947; if wired, the "Swift TypedModel is bound to one document" framing relaxes |
| D4 — JS `SaveOptions` (`forceWrite`, `upsertOn`, `targetDocument`) — Swift facade exposes none (`upsertOn` internal-only on DynamicModel); cf. #947 | param/options · P1 | ⚠️ Documented, drift NOT called out | working-with-documents.md:93-99 + examples/documents/model-upsert.swift (upsert shown dual via `upsertByUnique`/`save`-equivalent); guide DOCUMENTS.swift.md:1044-1053 documents `upsertOn` for JS `save()`; `forceWrite` documented nowhere | `forceWrite` caveat could appear; upsert example already dual via the workaround surface |
| D5 — `queryOne` missing on Swift facade (JS `BaseModel.queryOne`); tracked schema.md + #955 | missing-in-swift · (folded) | ✅ Documented + caveated | working-with-documents.md:53 (Read section lists "get the first match"); guide notes `query(...).first` as the Swift path (per sweep, schema.md:85) | n/a — known/tracked (#955); Swift reaches it via `query(...).first` |
| D7 — `Model.query()` facade has no typed projection (`QueryResult<T,P>`); projected rows silently dropped by `Type(row:)`; cf. #946, #954 | missing-in-swift + typedness · P2 | ❌ Not documented | — (projection not shown for Swift; the silent-row-drop hazard is unmentioned in documents docs/guide) | n/a — internal/advanced (projection on typed facade) |
| D9 — JS read/read-write permission-hint enforced on writes (+`forceWrite`); Swift facade has no hint concept (`requireMember` only checks open); cf. D4, #947 | missing-in-swift + behavioral · P2 | ❌ Not documented | — (permission-hint-on-write asymmetry not addressed; docs describe server permission levels at working-with-documents.md:14-18 but not the client-side write-hint/forceWrite gap) | n/a — internal/advanced (client-side write-hint enforcement) |
| D11 — JS stable error codes `ERR_DOC_CLOSED`/`ERR_DOC_UNRESOLVED` on write-target failures; Swift throws generic `.notFound`; cf. #947, #959 | error/event · P2 | ❌ Not documented | — (doc-write error codes not reconciled in documents docs/guide for the model write path) | n/a — internal/advanced (error-code parity) |

# 2. Databases & collections
## databases — docs page(s): docs/getting-started/working-with-databases.md, guides/latest/AGENT_GUIDE_TO_PRIMITIVE_DATABASES.{swift,ts,template}.md, examples/databases/**
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — Swift lacks `DatabaseChangeEvent`/`DatabaseChangePayload` typed payloads (refs #952 subscribe, #949 changeType, #954 typedness) | missing-in-swift + typedness · P1 | ⚠️ Documented, drift NOT called out | working-with-databases.md:529-548 (JS `onChange`/`event.changes`/`isOrigin` shape, no Swift payload note); guide swift.md:1346-1355 | n/a — internal/advanced (payload types land with #952; subscribe already caveated JS-only) |
| D2 — No Swift record CRUD/query surface; JS `connect()`→`DoDb` (query/find/save/patch/count/aggregate) absent (refs #954, #946/#955) | behavioral / missing-in-swift · P1 | ⚠️ Documented, drift NOT called out | guide swift.md:839-848 "Direct Record Operations" + 1102/1149 — JS-only TS `client.databases.connect(...)`, no Swift block, no JS-only caveat | Add JS-only caveat to the "Direct Record Operations" section (mirror the subscribe/importCsv banners); point Swift to `executeOperation` for ad-hoc reads |
| D3 — Swift `listManagers` docstring claims a nonexistent JS counterpart (contradicts api.md:129 Swift-only) | naming/convention · P3 | ❌ Not documented | — (examples/databases/db-managers.swift uses addManager/listPermissions; no listManagers in docs) | n/a — internal (source docstring fix, not user-facing docs) |
| Known — `subscribe()` missing in Swift (tracked #952) | behavioral / missing-in-swift · P1 | ✅ Documented + caveated | working-with-databases.md:504-508 (JavaScript-only warning); guide swift.md:5, swift.md:1322 ("no Swift equivalent… poll via executeOperation") | n/a — caveat already present (drop when subscribe ships) |
| Known — every Swift databases method returns/accepts untyped `[String:Any]` vs JS named interfaces (tracked #954) | typedness · P1 | ⚠️ Documented, drift NOT called out | examples/databases/db-managers.swift, db-batch.swift show raw-dict casts (`as? [String:Any]`) but no note that JS is typed; guide swift.md:139,1540-1542 | n/a — internal/advanced (caveat optional; surface is name-parity only per #954) |
| Known — `importCsv` rich pipeline JS-only; Swift only `importRows` (pre-parsed); `list()` no `databaseType` filter; manager param shapes (tracked #962) | param/options + behavioral · P1 | ✅ Documented + caveated | guide swift.md:1393 (importCsv "JavaScript only" banner + importRows alt); working-with-databases.md:570 ("In JavaScript you can also pass `{ databaseType }`") | n/a — caveats already present |
| Known — public `DatabaseChangeEvent.changeType` missing from JS public type (tracked #949) | error/event · P1 | ⚠️ Documented, drift NOT called out | working-with-databases.md:537 / guide swift.md comments reference `change.changeType: "enter"\|"update"\|"leave"` as if public | n/a — internal (compounds D1; fix when payload type exported) |
| Exempt — `getMetadata` absent in Swift (justified api.md:127; deprecated alias of getCelContext) | documented-intentional · — | ❌ Not documented | — (getCelContext shown via db-update-celcontext.swift; getMetadata deprecated, not in docs) | n/a — internal/advanced |

## databaseTypeConfigs — docs page(s): docs/getting-started/working-with-databases.md (type config via TOML/CLI), guides/latest/AGENT_GUIDE_TO_PRIMITIVE_DATABASES.swift.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — Swift `databaseTypeConfigs.delete()` returns `[String:Any]` not JS `{ success: boolean }` (distinct from #954) | return-shape · P1 | ❌ Not documented | — (docs cover type configs only via TOML `[type]` + `primitive sync push`; the client `databaseTypeConfigs.*` API is not surfaced) | n/a — internal/advanced (client type-config API undocumented) |
| D2 — Swift `databaseTypeConfigs` swallows decode failures with `?? [:]` / `?? []` instead of erroring (borders P0 silent-empty) | behavioral · P1 | ❌ Not documented | — | n/a — internal/advanced |
| Known — pervasive `[String:Any]` typedness on list/get/create/update + params (tracked #954) | typedness · — | ❌ Not documented | — (only TOML-side `databaseType` config documented; client API absent) | n/a — internal/advanced |

## collections — docs page(s): docs/getting-started/working-with-documents.md (collection usage), examples/documents/list-collection-documents.{ts,swift}
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — All 16 Swift `CollectionsAPI` methods return untyped `[String:Any]` vs JS typed interfaces (refs #954, #938) | typedness (+ return-shape) · P1 | ❌ Not documented | — (docs only show listing docs via a collection: working-with-documents.md:237-245; no collections-client typed surface) | n/a — internal/advanced |
| D2 — Swift `collections.addMember` returns flat `[String:Any]` not JS `CollectionAddMemberResult` discriminated union (refs #453 groups analog, #671) | return-shape (+ typedness) · P1 | ❌ Not documented | — | n/a — internal/advanced |
| D3 — Swift collection mutators (delete/removeDocument/revokeGroupPermission/removeMember) return `[String:Any]` not `{ success: boolean }`; decode failures swallowed (refs #954) | return-shape (+ behavioral) · P2 | ❌ Not documented | — | n/a — internal/advanced |
| D4 — Swift `listAll` uses positional `limit`/`cursor` while siblings take `PaginationOptions`; JS uses `PaginationOptions` uniformly; raw-cursor-interpolation latent bug (refs #954) | param/options (+ naming) · P3 | ❌ Not documented | — | n/a — internal/advanced |

## collectionTypeConfigs — docs page(s): docs/getting-started/users-and-groups.md (one client mention), TOML config-type-config path
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — Swift `collectionTypeConfigs.delete` returns `[String:Any]` not JS `{ success: boolean }`; cast-miss → silent `[:]` (refs #954) | return-shape (+ typedness) · P2 | ❌ Not documented | — (users-and-groups.md:188 only mentions `client.collectionTypeConfigs` to bind rule sets; no return-shape detail) | n/a — internal/advanced |
| D2 — Swift collection-type-config path methods fall back to unescaped `collectionType` on percent-encoding failure; differing escape spec vs `encodeURIComponent` (refs #596 closed) | behavioral · P3 | ❌ Not documented | — | n/a — internal/advanced |
| Known — `[String:Any]` typedness across all 5 methods (tracked #954) | typedness · — | ❌ Not documented | — | n/a — internal/advanced |

# 3. Users, groups & me

Legend — In docs?: ❌ Not documented · ⚠️ Documented, drift NOT called out · ✅ Documented + caveated

## me — docs page(s): sharing-and-invitations.md (§Listing the User's Documents), guides/latest/AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.swift.md (§Current user)
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 `me.get()` returns `[String: Any]?` vs JS `UserProfile?` | typedness · P1 | ⚠️ Documented, drift NOT called out | swift-guide:191 (`get()` returns `{ userId, email, name, appRole, appId, avatarUrl? }`); user-model fields users-and-groups.md:9-16; general dict caveat swift-client.md:446 | Drop "responses come back as `[String: Any]`" caveat for `me.get`; show typed `UserProfile` |
| D2 `me.update()` params/return `[String: Any]` vs `UpdateMeParams`→`UserProfile` (avatarUrl null=clear) | typedness · P1 | ⚠️ Documented, drift NOT called out | swift-guide:177-178 shows `params: ["name":..,"avatarUrl":..]` untyped; no clear-avatar note | Type `update` params/return; document `avatarUrl: null` clears avatar |
| D3 `me.ownedDocuments()` drops 7 of 10 JS options (includeRoot/localOnly/refreshFromServer/serverTimeoutMs/waitForLoad/forward/returnPage) | param/options · P1 | ⚠️ Documented, drift NOT called out | sharing-and-invitations.md:354-355 lists full JS option set; swift-guide:197,209 shows only `limit/tag`+`returnPage` claim | Add missing options to Swift `ownedDocuments` OR doc Swift wire-only subset |
| D4 `me.ownedDocuments()`/`sharedDocuments()` bare HTTP GET; JS does offline-first cache-merge/stale-refresh/includeRoot (#938) | behavioral · P1 | ⚠️ Documented, drift NOT called out | swift-guide:209 claims "cache-backed and offline-aware" (contradicts client — bare GET); sharing-and-invitations.md:350-368 | Either wire offline-first into Swift OR fix guide line 209 to say network-only |
| D5 `uploadAvatar`/`pendingDocumentInvitations`/`cacheInfo` untyped (+ `contentType` String vs 4-MIME union; cacheInfo tuple) | typedness · P2 | ⚠️ Documented, drift NOT called out | swift-guide:182-183 (`uploaded["avatarUrl"] as? String`), :187 (`cacheInfo` tuple), :211 (pending shape as comment) | Type `AvatarUploadResult`/`PendingDocumentInvitation`/`CacheInfo`; enum `contentType` |
| #938 owned=array vs shared=`{items,cursor}` default-shape mismatch; Swift both untyped envelope | return-shape/default-value · (tracked) | ⚠️ Documented, drift NOT called out | sharing-and-invitations.md:354-366 documents the JS owned-array vs shared-envelope split; Swift dict not flagged | Note Swift returns untyped envelope for both until typed |

## users — docs page(s): users-and-groups.md (§Listing and Looking Up Users), sharing-and-invitations.md (§Checking Who a Document Is Shared With), guides/latest/AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.swift.md (§Look up users)
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 `users.getBasic` takes generic `FetchCachedOptions` vs JS named `GetUserOptions` (same 4 fields) | param/options · P2 | ⚠️ Documented, drift NOT called out | swift-guide:80 names the fields but via `GetUserOptions`/generic; field set matches | Confirm shared-options convention OR add `GetUserOptions` typealias in guide |
| D2 `users.getBasic` skips cache+options when `CacheFacade==nil`; JS always caches | behavioral · P2 | ❌ Not documented | — | Confirm cache always injected; else document no-cache fallback ignores staleness opts |
| #954 `getBasic`/`getProfiles`/`lookup` return `[String: Any]`/`[[String: Any]]` vs typed `BasicUserInfo`/`BatchUserProfile[]`/`{exists,user?}` | typedness · (tracked) | ⚠️ Documented, drift NOT called out | swift-guide:68-75,125-127 documents the JS typed shapes as the result shapes; general dict caveat swift-client.md:446; lookup shape sharing-and-invitations.md:162-164 | Add typed result structs; drop blanket dict caveat for users surface |

## groups — docs page(s): users-and-groups.md (§Managing Members), sharing-and-invitations.md (§Group Membership by Email, §Removing Someone), guides/latest/AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.swift.md (§Groups)
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 `groups.addMember` returns `[String: Any]`; JS returns `DirectGroupAdd\|DeferredGroupAdd` discriminated union (#453 shipped JS-only) | return-shape+typedness · P1 | ⚠️ Documented, drift NOT called out | users-and-groups.md:69-76 + sharing-and-invitations.md:178-186 document the JS union/status table; swift-guide:309-322 shows the dict keys as a comment, not a typed union | Add Swift `GroupAddMemberResult` enum; replace dict-key comment with typed branch |
| D2 `groups.list`/`listMembers` return `[String: Any]` vs typed `PaginatedResult<GroupInfo>` / `{items:GroupMemberInfo[],cursor?}` | return-shape+typedness · P1 | ⚠️ Documented, drift NOT called out | swift-guide:271 ("returns paginated `{items,cursor}`"); listMembers shape sharing-and-invitations.md:413-414 | Return `PaginatedResult<GroupInfo>`/`PaginatedResult<GroupMemberInfo>` |
| D3 `groups.addMember` params `[String: Any]` drops JS userId-XOR-email compile contract | param/options+typedness · P1 | ⚠️ Documented, drift NOT called out | users-and-groups.md:57,67 ("Provide either email or userId, not both") — stated, but Swift dict can't enforce it | Add Swift `GroupMemberRef` enum (userId XOR email) |
| D4 `groups.removeMember` takes userId only; email path split into Swift-only `removeMemberByEmail` (JS one overloaded method); return untyped | param/options+behavioral · P2 | ✅ Documented + caveated | swift-guide:355-372 documents `removeMemberByEmail` as the Swift email path explicitly; JS single-method form sharing-and-invitations.md:462-468 | None needed for split (caveated); still type return `{success:Bool}` |
| #960 `groups.listUserMemberships` missing `{groupType}` server-side filter (Swift returns all) | param/options · (tracked) | ✅ Documented + caveated | swift-guide:391 ("Swift client returns all memberships; filter client-side"); users-and-groups.md:67 ("in JavaScript you can also pass `{ groupType }`") | If added to Swift, drop the "filter client-side" caveat |
| #954 every groups method returns `[String: Any]`/`[[String: Any]]` vs named interfaces | typedness · (tracked) | ⚠️ Documented, drift NOT called out | swift-guide:273,388 documents JS typed shapes as the shapes; general dict caveat swift-client.md:446 | Add typed structs; remove blanket dict caveat |

## groupTypeConfigs — docs page(s): users-and-groups.md (§Rule Sets), guides/latest/AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.swift.md (§Group Type Configuration)
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 all 5 methods return/accept `[String: Any]` vs typed `GroupTypeConfigInfo`/`Create*`/`Update*Params` (#954 doesn't enumerate this surface) | typedness · P1 | ❌ Not documented | — (guide §Group Type Configuration covers TOML/CLI only; no Swift SDK method signatures shown); general caveat swift-client.md:446 | Add typed structs; add a Swift `groupTypeConfigs` SDK example to the guide |
| D2 `groupTypeConfigs.delete` returns `[String: Any]` vs JS `{ success: boolean }` | return-shape · P1 | ❌ Not documented | — | Return typed `{success:Bool}`; document `delete` shape |
| D3 Swift does NOT URL-encode `groupType` path segment on get/update/delete; JS does (#590 JS+server-only fix) | behavioral · P1 | ❌ Not documented | — (no client `groupTypeConfigs` calls documented for either lang) | Percent-encode `groupType` in Swift (Swift-side completion of #590) |

# 4. Invitations & sharing
## invitations — docs page(s): sharing-and-invitations.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — `invitations.*` return untyped `[String: Any]` vs JS typed interfaces (`InvitationQuota`, `AppInvitationInfo`, delete result) [#954 surface-scope] | typedness · P1 | ⚠️ Documented, drift NOT called out (docs/guide print JS-typed shapes; `invite-quota.swift` shows untyped dict access but never flags it as drift) | sharing-and-invitations.md:62-63 (quota shape), :424 (invite fields); examples `invite-quota.swift`, `invite-create.swift`; guide `...SHARING_AND_INVITATIONS.swift.md:147-156` | Drop the per-field dict-cast snippets; show typed `InvitationQuota`/`AppInvitationInfo` Swift structs |
| D2 — `invitations.list` collapses typed `{ items, cursor }` envelope + `InvitationListOptions` into `[String: Any]`/flat params [rel #938] | return-shape + param/options · P1 | ⚠️ Documented, drift NOT called out (docs destructure `{ items }`; Swift example uses opaque `let list = ...` with no items access) | sharing-and-invitations.md:79, :422; examples `invitations-list-cancel.swift`, `app-invitation.swift`; guide swift.md:148 (`-> { items, cursor }`) | Show typed `InvitationListResult.items: [AppInvitationInfo]` + cursor in Swift list example |
| D3 — `invitations.accept` discards typed `AcceptInviteResult` incl. nested `grantsResolved` counts [rel #466] | return-shape / typedness · P1 | ⚠️ Documented, drift NOT called out (guide prints `{ status, grantsResolved: {groups,documents} }`; `accept-invitation.swift` ignores result entirely) | guide swift.md:243-245; example `accept-invitation.swift` (`_ = result`); page :245,:259 (accept narrative) | Show Swift `AcceptInviteResult` with `grantsResolved` decode in accept example |
| D4 — `listDeferredGrants`/`revokeDeferredGrant` drop `DeferredGrant` union, `nextCursor` envelope, revoke result, and `"document"\|"group"` literal type [rel #466] | typedness / return-shape + param/options · P1 | ⚠️ Documented, drift NOT called out (guide prints JS `{ grants, nextCursor }` + `"document"\|"group"`; no Swift form, admin-debug-only so no example) | guide swift.md:152-153, :489-491; page :291,:467 (deferred narrative) | Show typed `DeferredGrant` enum + `DeferredGrantType` in Swift deferred-grants guide snippet |

### Known doc bugs on this page (independent of parity)
- **`getAcceptToken` (sharing-and-invitations.md:104-105):** method does not exist in the JS client either — removed/renamed to `invitations.get()` under #496 (accept token now on `get()`'s `inviteToken` field). Per sweep, #953 is STALE/INVALID. Doc should replace the `getAcceptToken(invitationId)` snippet with `invitations.get(invitationId)` (reads `inviteToken`); also fix the guide's "JavaScript-only `getAcceptToken`" note (swift.md/ts.md:5).
- **`denyAccessRequest({reason})` (sharing-and-invitations.md:332):** `reason` is not a real param of `documents.denyAccessRequest(documentId, requestId, ...)`. Doc should drop the `{ reason: ... }` options object (no such field on the API).

# 5. Authentication
## auth — docs page(s): authentication.md (+ swift-client.md)
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — `EnableOfflineAccessOptions` diverges (`preferBiometric`/`allowPinFallback`/`retention`/`pinProvider` missing; `requireBiometric` Swift-only) | param/options · P1 | ❌ Not documented | — (no offline-access section in guide; `authentication.md` has none; no example pair) | Document one offline-access options struct shared by both clients |
| D2 — offline-access biometric default differs (JS `"signed"` vs Swift `requireBiometric=true` → `"biometric"`) | default-value · P2 | ❌ Not documented | — | State the single default grant method once aligned |
| D3 — `AUTH_CODES` (JS) vs `AuthCode` (Swift) different shapes + both omit server codes (`RATE_LIMITED`/`OTP_MAX_ATTEMPTS`/`OTP_NOT_ENABLED`/`RESERVED_EMAIL_FOR_ADMIN`) | error/event · P1 | ✅ Documented + caveated | AGENT_GUIDE_..._AUTHENTICATION.swift.md:218-239 (shape diff + missing server-code list + Swift no-`AUTH_CODES` note) | Replace string-literal server-code guidance with the canonical typed list |
| D4 — `getAuthConfig()`/`getAppConfig()` return untyped `[String: Any]` vs JS typed object | typedness · P1 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_..._AUTHENTICATION.swift.md:19-24; examples/auth/get-auth-config.swift (raw dict shown as the API, no JS-typed contrast) | Swap dict + key-comment for the `AuthConfig`/`AppConfig` struct fields |
| D5 — `magicLinkVerify`/`otpVerify` return untyped `[String: Any]` vs JS `{ user, isNewUser, promptAddPasskey }` | typedness/return-shape · P1 | ✅ Documented + caveated | AGENT_GUIDE_..._AUTHENTICATION.swift.md:149,190 ("returns the raw `[String: Any]` response"); examples magic-link.swift/otp.swift | Return typed `AuthVerifyResult`; update verify examples to typed fields |
| D6 — `enableOfflineAccess` returns untyped `[String: Any]` vs JS `{ enabled, method?, reason? }` | typedness/return-shape · P1 | ❌ Not documented | — (no offline-access section/example) | Document typed `{ enabled, method, reason }` result for both clients |
| D7 — `startOAuthFlow`/`magicLinkVerify`/`otpVerify` lack JS `inviteToken` (+ OAuth `waitlist`) options | param/options · P1 | ✅ Documented + caveated | AGENT_GUIDE_..._AUTHENTICATION.swift.md:75,149,170,190 ("TypeScript client only — Swift ... has no waitlist/inviteToken options") | Drop the TS-only caveats; show `inviteToken`/`waitlist` on Swift signatures |
| D8 — `logout` accepts only `wipeLocal` (JS has `redirectTo`/`revokeOffline`/`clearOfflineIdentity`/`waitForDisconnect`) + Swift skips server `/auth/logout` cookie clear | param/options + behavioral · P1 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_..._AUTHENTICATION.swift.md:477-489 (options gap covered); examples/auth/logout.swift — but server cookie-clear gap unmentioned | Drop TS-only logout caveat; note Swift now POSTs `/auth/logout` |
| D9 — static `exchangeOAuthCode` omits `refreshProxyBaseUrl`/`refreshProxyCookieMaxAgeSeconds` | param/options · P2 | ✅ Documented + caveated | AGENT_GUIDE_..._AUTHENTICATION.swift.md:117 ("Swift ... without the refresh-proxy parameters — always exchanges directly") | Remove caveat; add refresh-proxy params to Swift static helper docs |
| Exempt — Passkey methods absent in Swift (`passkey*`) | documented-intentional | ✅ Documented + caveated (exempt) | AGENT_GUIDE_..._AUTHENTICATION.swift.md:245 ("TypeScript-only, no Swift equivalent"); justified by swift-client/docs/exclusions-v1.md:81-91 (Apple AuthorizationServices; #929) | None — intentional per exclusions-v1.md |
| Exempt — `webauthn-large-blob` helper absent in Swift | documented-intentional | ✅ Documented + caveated (exempt) | exclusions-v1.md:93-95 ("permanent — iOS doesn't expose this surface"); not surfaced in user docs (browser-internal) | None — permanent exclusion per exclusions-v1.md |

# 6. Blob buckets
## blobBuckets — docs page(s): blob-buckets.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — `createBucket` params + TTL/access enums untyped `[String: Any]` | typedness · P1 | ⚠️ Documented, drift NOT called out | examples/blobs/bucket-admin.swift (`createBucket(params: [...])` dict, untyped `ttlTier`/`accessPolicy` strings) | Swap dict for `CreateBlobBucketParams` + enum values in example |
| D2 — read models (`BlobBucketInfo`, `BlobInfo`) returned as `[String: Any]` | typedness · P1 | ⚠️ Documented, drift NOT called out | examples/blobs/bucket-manage.swift (`getMetadata` → untyped `meta`); bucket-admin.swift (`listBuckets`/`getBucket`) | Show typed `BlobBucketInfo`/`BlobInfo` field access in example |
| D3 — `list` / `getSignedUrl` returns untyped (no `BucketBlobListResult`/`BlobSignedUrlResult`) | typedness/return-shape · P1 | ⚠️ Documented, drift NOT called out | examples/blobs/bucket-read.swift:`signed["url"] as? String`; bucket-manage.swift:`page["items"] as? [[String: Any]]` | Replace dict casts with typed result struct fields |
| D4 — delete mutations drop `{ deleted: boolean }` shape | typedness/return-shape · P2 | ❌ Not documented | examples discard returns (`_ = try await ...delete`/`deleteBucket`), so shape never shown | Show typed `deleted` result once Swift returns it |
| D5 — `upload` data-type (`Data`-only) + flat options + untyped return | param/options · P1 | ⚠️ Documented, drift NOT called out | examples/blobs/bucket-upload.swift (`data: Data`, flat args, `result["blobId"] as? String`) | Typed `BlobInfo` return; note `Data`-only vs JS `string`/`Blob` |

# 7. Workflows, prompts, integrations, cron

## workflows — docs page(s): docs/getting-started/workflows-and-prompts.md, guides/latest/AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.swift.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — Swift `start`/`getStatus`/`listRuns`/`listStepRuns`/apply methods return untyped `[String: Any]` vs JS typed result structs | typedness+return-shape · P1 | ⚠️ Documented, drift NOT called out | workflows-and-prompts.md:124; WORKFLOWS.swift.md:969; examples/workflows/workflow-start.swift, workflow-list-step-runs.swift | Replace "return untyped `[String: Any]`" caveat with typed-result examples |
| D2 — Swift `WorkflowStartedEvent` carries only `{workflowKey, runId}` vs JS 8-field payload | error/event · P1 | ⚠️ Documented, drift NOT called out | WORKFLOWS.swift.md:1010 (shows full JS payload as if available) | Drop the JS-only field list or add the missing fields to the Swift event |
| D3 — Swift workflow option/param objects flattened to positional args (`define`/`listStepRuns`/`getStatus`/`meta`) | param/options · P2 | ⚠️ Documented, drift NOT called out | examples/workflows/workflow-start.swift, workflow-list-step-runs.swift (positional shown, not flagged) | Note positional-args-mirror-JS-options convention as intentional |
| D4 — Swift `getStatus` injects Swift-only `normalizedStatus` field absent from JS | behavioral/return-shape · P2 | ❌ Not documented | — | Document `normalizedStatus` as a Swift-only convenience field (or add to JS) |
| runSync (#956) — `workflows.runSync` JS-only, no Swift equivalent (exempt) | documented-intentional · — | ✅ Documented + caveated | workflows-and-prompts.md:128-130 (warning box); WORKFLOWS.swift.md:3,971 (#956 cited) | (exempt — Swift-only orchestration / planned follow-up) |

## prompts — docs page(s): docs/getting-started/workflows-and-prompts.md, guides/latest/AGENT_GUIDE_TO_PRIMITIVE_PROMPTS.swift.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — Swift `prompts.get`/`prompts.list` have no JS equivalent and hit non-existent app-api routes (404) | missing-in-js+behavioral · P1 (P0 runtime) | ❌ Not documented | — (client `prompts.list/get` absent from all docs/examples/guides; guide:314-315 are CLI-only) | None needed if removed; if kept, document the route + JS parity |
| D2 — Swift `prompts.execute` returns untyped `[String: Any]` vs JS typed `ExecutePromptResult` | typedness · P1 | ⚠️ Documented, drift NOT called out | workflows-and-prompts.md:410; examples/prompts/prompt-execute-config.swift (reads `result["success"] as? Bool` etc.) | Swap stringly-keyed reads for typed `ExecutePromptResult` fields |
| D3 — Swift `execute(promptKey:variables:modelOverride:configId:)` positional overload has no JS analog | param/options · P2 | ❌ Not documented | — (docs/examples use only the options-struct form) | None if deprecated/removed; else note the legacy overload |

## integrations — docs page(s): docs/getting-started/api-integrations.md, docs/getting-started/workflows-and-prompts.md, guides/latest/AGENT_GUIDE_TO_PRIMITIVE_INTEGRATIONS.swift.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — Swift `IntegrationsAPI` adds `list()`/`get()` that JS does not expose | missing-in-js · P2 | ❌ Not documented | — (client `integrations.list/get` absent from all docs/examples/guides; api-integrations.md:144-151 are CLI-only) | None if removed; if kept, document + add typed JS parity |
| D2 — Swift `IntegrationCallResponse.body` is `Any?` vs JS generic `IntegrationCallResponse<T>.body: T` | typedness · P1 | ⚠️ Documented, drift NOT called out | examples/integrations/integration-call-response.swift (`response.body as Any`); INTEGRATIONS.swift.md:445 | Make `call` generic / typed-body and show typed `body` in the example |

## cronTriggers — docs page(s): docs/getting-started/scheduled-and-realtime-automation.md, guides/latest/AGENT_GUIDE_TO_PRIMITIVE_SCHEDULING_AND_REALTIME.swift.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — Swift read methods (`get`/`create`/`update`/`pause`/`resume`) return `[String: Any]` vs JS typed `CronTriggerInfo` | typedness · P1 | ⚠️ Documented, drift NOT called out | examples/scheduling/cron-create.swift, cron-lifecycle.swift, cron-manage.swift (stringly-keyed, not flagged) | Show typed `CronTriggerInfo` reads instead of `trigger["triggerId"]` |
| D2 — Swift `cronTriggers.list` returns `[String: Any]` vs JS typed `CronTriggerListResult` | typedness/return-shape · P1 | ⚠️ Documented, drift NOT called out | examples/scheduling/cron-manage.swift:11 (`list["items"] as? [[String: Any]]`); SCHEDULING.swift.md:11 | Type `list()` and drop the `["items"] as?` cast in the example |
| D3 — Swift `create`/`update` take `params: [String: Any]` vs JS typed `Create`/`UpdateCronTriggerParams` | param/options · P1 | ⚠️ Documented, drift NOT called out | examples/scheduling/cron-create.swift, cron-lifecycle.swift (dict literals, required/enum fields unenforced) | Use typed param structs in the create/update examples |
| D4 — Swift `delete`/`test` return `[String: Any]` vs JS `{archived}` / `{started, runId?, ...}` | typedness/return-shape · P1 | ⚠️ Documented, drift NOT called out | examples/scheduling/cron-lifecycle.swift:185, cron-manage.swift:13 (untyped, results discarded) | Show typed `delete`/`test` result structs |
| D5 — Swift cron methods coerce non-dict/decode failure to empty `[:]` (silent success) instead of throwing | behavioral · P1 | ❌ Not documented | — (the `?? [:]` pattern appears in examples but the silent-empty risk is never stated) | Document/throw on malformed body; note the no-silent-empty contract |

# 8. Analytics, events, errors

## Analytics — docs page(s): docs/getting-started/analytics.md; guides/latest/AGENT_GUIDE_TO_PRIMITIVE_ANALYTICS.{swift,ts,template}.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — analytics methods are flat (not `client.analytics.*`) + `logSnapshot` missing in Swift | missing-in-swift+naming · P1 | ⚠️ Documented, drift NOT called out | analytics.md:7-9 (JS-only warning, generic "no public analytics API"); guide swift L5 | Drop/relax JS-only warning; document Swift `client.analytics` namespace + `logSnapshot` |
| D4 — Swift emits NO client-side auto events (boot/dailyAuth/returnActive/firstDoc*/sessionEnd/sync/blob/llm) | behavioral · P0 | ⚠️ Documented, drift NOT called out | analytics.md:15-26 "Client-Side Auto Events" + :7-9 (warning says Swift "still gets server-side auto-tracking", silent on missing client emission); guide swift L23 "All enabled by default…automatically emits" | Remove the cross-platform claim; "Client-Side Auto Events" fire in JS only — drop the warning's "client auto-events" implication |
| D3 — `analyticsAutoEvents` config absent on Swift (#963) | param/options+typedness · — | ⚠️ Documented, drift NOT called out | analytics.md:126-147 "Configuring Auto Events" (TS-only, no Swift caveat) | Drop the auto-events config section / note it once Swift gains the typed option |
| D5 — `AnalyticsContext.logEvent`/`isEnabled` untyped in Swift (`[String:Any]`/`String?` vs typed union) | typedness · P1 | ❌ Not documented | — | Document typed `logEvent`/`AnalyticsPhase` on Swift `AnalyticsContext` |
| D6 — Swift `getLlm/getGeminiAnalyticsContext()` always non-nil; JS returns `null` when feature disabled | behavioral · P1 | ❌ Not documented | — | Document `nil`-when-disabled getter contract + per-phase `isEnabled` |

## Events — docs page(s): guides/latest/AGENT_GUIDE_TO_PRIMITIVE_{WORKFLOWS,BLOBS}.swift.md; docs/getting-started/scheduled-and-realtime-automation.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — Swift `WorkflowStartedEvent` has only `{workflowKey,runId}` vs JS 7 fields | error/event (payload) · P1 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_..._WORKFLOWS.swift.md:1009-1010 (TS block in swift guide documents full JS payload, no Swift caveat) | Add the 5 missing fields to Swift struct; remove per-field caveat needed in guide |
| D2 — Swift `BlobUploadProgressEvent` drops 8 JS fields + renames (`numBytes`→`bytesTransferred`/`totalBytes`) | error/event (payload) · P1 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_..._BLOBS.swift.md:330-353 ("Events (JS-only)" — documents JS shape `queueId/status/numBytes/attempts`, never states Swift struct shape) | Align Swift struct to JS queue-item shape (or document the reduced byte-progress view) |
| D3 — Swift `BlobUploadCompletedEvent` drops 5 JS fields | error/event (payload) · P2 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_..._BLOBS.swift.md:338-340 (JS-only block; Swift shape unstated) | Add missing fields to Swift struct |
| D4 — Swift `BlobUploadFailedEvent` drops 6 JS fields + `lastError`→`error` rename/optionality flip | error/event (payload) · P2 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_..._BLOBS.swift.md:342-344 (JS-only block reads `e.lastError`/`e.willRetry`; Swift shape unstated) | Rename Swift `error`→`lastError` (optional) + add fields |
| D5 — Swift `SyncPerfEvent` (`phase`/`elapsedMs`) diverges entirely from JS `timings`/`clientTimings` | error/event (payload) · P2 | ❌ Not documented | — | Document one syncPerf shape; expose JS `timings`/`clientTimings` on Swift |
| D6 — `documentMetadataChanged.source` Swift `"local"/"remote"` vs JS `"local"/"server"/"idb"` | error/event (enum-value) · P2 | ❌ Not documented | — | Pick one `source` vocabulary; note it like the `documentLoaded` precedent |
| D7 — Swift `AwarenessEvent` (`states` snapshot) vs JS `added`/`updated`/`removed` delta | error/event (payload)+typedness · P1 | ❌ Not documented | — | Document one awareness contract; expose same field names both sides |

## Errors — docs page(s): docs/getting-started/api-integrations.md; docs/getting-started/sharing-and-invitations.md; guides/latest/AGENT_GUIDE_TO_PRIMITIVE_INTEGRATIONS.swift.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 — Swift `JsBaoError.details` is `[String:String]?` but JS `details` carries heterogeneous objects (`status:Int`, nested `payload`, booleans) | typedness/return-shape · P1 | ⚠️ Documented, drift NOT called out | api-integrations.md:120 (`error.details` JS); sharing-and-invitations.md:307 (`err.details?.canRequestAccess` bool); INTEGRATIONS.swift.md:494 (`JsBaoError.details` referenced, type unstated) | Give Swift a typed/`JSONValue` `details`; then docs' nested-value reads work cross-platform |
| D2 — Swift `JsBaoError` drops JS `name`; class-vs-struct identity | return-shape · P3 | ❌ Not documented | — | Add one-line note "Swift omits the JS `name` discriminator; use `is JsBaoError`" |
| D3 — `isJsBaoError` JS duck-types any `{code:string}`; Swift is exact `is JsBaoError` | behavioral · P2 | ⚠️ Documented, drift NOT called out | api-integrations.md:98,111 (presents `isJsBaoError` as the JS guard, Swift uses typed catch; behavioral difference of the guard itself unstated) | Note Swift `isJsBaoError` is instance-only (no JSON-revival duck-type) |

# 9. Infra (gemini, llm, cache, codegen, ruleSets, session)

## gemini — docs page(s): analytics.md (analytics only), workflows-and-prompts.md (workflow `kind`, not SDK); client `gemini.*` SDK surface itself: none
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 `generateRaw` validation throws `INVALID_ARGUMENT` (Swift) vs `GEMINI_ERROR` (JS) | error/event · P2 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D2 Swift `GeminiAPI` does not normalize errors to `GEMINI_ERROR` and emits no analytics | behavioral + missing-in-swift · P1 | ⚠️ Documented, drift NOT called out | analytics.md:26 (`prompt_started/_succeeded/_failed` listed for `gemini` with no Swift caveat); AGENT_GUIDE_TO_PRIMITIVE_ANALYTICS.swift.md:37-39 claims gemini events fire | Drop "Swift emits gemini analytics" claim until aligned, or mark gemini analytics JS-only |
| D3 Swift `models()` returns `[String: Any]` vs JS `{ models: string[]; defaultModel: string }` | return-shape/typedness · P1 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D4 all gemini methods take/return `[String: Any]`/`Any` (#954 instance) | typedness · P1 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_TO_PRIMITIVE_SWIFT_CLIENT.md:79 ("full sub-API parity … params … match" incl. `.gemini`) | Soften the blanket `.gemini` parity claim to note untyped Swift params/returns |

## llm — docs page(s): analytics.md, workflows-and-prompts.md (`llm.chat` workflow `kind`, not SDK); client `llm.chat`/`llm.models` SDK surface: none
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 Swift `LlmAPI.chat` emits no analytics events (JS emits `prompt_started/_succeeded/_failed`) | missing-in-swift + behavioral · P1 | ⚠️ Documented, drift NOT called out | analytics.md:26 (`prompt_started/_succeeded/_failed` for `llm`); AGENT_GUIDE_TO_PRIMITIVE_ANALYTICS.swift.md:34-36 ("`client.llm.chat()` request begins" etc., presented as firing on Swift) | Mark llm analytics auto-events JS-only until Swift wires the context |
| D2 Swift `chat`/`models` use `[String: Any]`; JS has `LlmChatOptions` + `attachments`/`reasoning` typed unions | typedness/param-options · P1 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_TO_PRIMITIVE_SWIFT_CLIENT.md:79 ("full sub-API parity … params … match" incl. `.llm`) | Note Swift llm params are untyped dicts, not typed `LlmChatOptions`/attachment unions |

## cache — docs page(s): users-and-groups agent guides (`FetchCachedOptions` shown working in Swift); swift-client.md; client `cache.*` facade: none
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 Swift `fetchHttp` drops `query` from request + cache key, omits `body` from key | behavioral · P0 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D2 `fetchHttp` `query` is `[String: Any]`, no array/nested encoding | typedness/param · P1 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D3 `cache.key` produces different keys (`base:<json>` vs `base?k=v&`) | behavioral + typedness · P1 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D4 `cache.info` returns object `{updatedAt?, ageMs?}` (JS) vs tuple (Swift) | return-shape · P2 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D5 `info` `ageMs` `number` (JS) vs `Double` (Swift) | typedness · P2 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D6 `clear`/`clearAll` swallow storage errors on both (aligned; sig cosmetics) | behavioral · P3 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D7 JS cache emits `cacheUpdated`/`cacheUpdateFailed`; no Swift equivalent | error/event + missing-in-swift · P1 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D8 Swift `fetchCached` ignores `waitForLoad`/`serverTimeoutMs`/offline (silent no-ops) | behavioral + error · P1 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_TO_PRIMITIVE_USERS_AND_GROUPS.swift.md:168-172 + :80 show `waitForLoad`/`serverTimeoutMs`/`refreshIfOlderThanMs` as live Swift `FetchCachedOptions`; swift-client.md grep confirms same options doc'd | Flag that `waitForLoad`/`serverTimeoutMs` are no-ops in Swift cache until implemented |
| D9 `fetchCached` `keyOrParts` `string\|any[]` (JS) vs `String` only (Swift) | param/options · P2 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D10 Swift `KvCache` exposes public `get`/`set`; JS has none | missing-in-js · P2 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D11 `setUserId`/`setStorageProvider` lifecycle split (aligned) | naming/structure · P3 | ❌ Not documented | — | n/a — internal, not doc-facing |

## codegen-conventions — docs page(s): defining-your-models.md (JS-centric); choosing-your-data-model.md
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 Swift codegen drops `enum` field key (JS emits string-literal union); Swift runtime rejects it strictly | missing-in-swift · P1 | ❌ Not documented | — | Add `enum` to field-types/options table in defining-your-models.md once Swift accepts it |
| D2 Swift model codegen ignores `auto_stamp` (JS round-trips it) | missing-in-swift · P2 | ❌ Not documented | — | Add `auto_stamp` to field-options in defining-your-models.md once Swift applies it |
| D3 name-derivation diverges: JS singularizes (`tasks`→`Task`), Swift PascalCase+`Record` (`tasks`→`TasksRecord`) | naming · P1 | ⚠️ Documented, drift NOT called out | defining-your-models.md:129,146-151 ([models.authors]→`Author`/`Post` shows JS singularization; no Swift `Record`/`class_name` note) | Document the default-name divergence + `class_name` for cross-client identity |
| D4 Swift codegen has no `--check` and no strict/`--no-strict` unknown-key mode | param/options · P2 | ❌ Not documented | — | Document Swift codegen `--check`/strict once added (or note absence) |
| D5 Swift codegen emits no relationship accessors; JS emits `posts()`/`author()`/`addTag`/`removeTag` | missing-in-swift · P1 | ⚠️ Documented, drift NOT called out | defining-your-models.md:143-160 (JS `author.posts()`/`firstPost.author()` traversal methods shown; no Swift caveat) | Note Swift relationship accessors come from runtime layer, not codegen, until emitted |
| D6 JS codegen emits self-registering `index.ts` barrel; Swift has no registration step | behavioral · P2 | ⚠️ Documented, drift NOT called out | defining-your-models.md:13,21,177,227 (barrel + `attachAndRegisterModel` doc'd as the model-availability story; no Swift equivalent) | Add Swift's static-conformance model-availability story (no barrel) to the page |

## ruleSets — docs page(s): users-and-groups.md (lines 173-192); databases agent guides (`[ruleSet]` TOML/CEL shape)
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D1 Swift ruleSets CRUD returns `[String: Any]` vs JS `RuleSetInfo`/`RuleSetSchema`/etc. (#954 instance) | typedness · P1 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_TO_PRIMITIVE_SWIFT_CLIENT.md:79 ("full sub-API parity … match" incl. `.ruleSets`) | Note Swift ruleSets returns are untyped dicts in the parity claim |
| D2 Swift ruleSets params untyped, dropping CEL `triggers[].{on,when,set}` rule grammar | typedness/params · P1 | ⚠️ Documented, drift NOT called out | users-and-groups.md:177-192 + AGENT_GUIDE_TO_PRIMITIVE_DATABASES.swift.md:249-261 (CEL `[ruleSet]`/`[rules.*]` grammar shown without typed Swift structs) | Note Swift passes rule grammar as free-form dicts, not typed `CreateRuleSetParams` |
| D3 Swift `delete` returns `[String: Any]` vs JS `{ success: boolean }` | typedness/return · P2 | ❌ Not documented | — | n/a — internal, not doc-facing |
| D4 Swift `list(resourceType:)` flat param vs JS `ListRuleSetsOptions` object | param/options · P2 | ❌ Not documented | — | Document the options-object-vs-flat-param convention so future filters stay aligned |

## session — docs page(s): none (SDK `session.get()` only in auto-gen reference/js-bao-wss-client/api/README.md:2929; not in getting-started or agent guides)
| Finding | Class · Sev | In docs? | Where | If Swift aligned → doc fix |
|---|---|---|---|---|
| D-record `session.get()` returns `[String: Any]` (Swift) vs typed `SessionInfo` (JS) — sole divergence, tracked under #954 | typedness · P1 | ⚠️ Documented, drift NOT called out | AGENT_GUIDE_TO_PRIMITIVE_SWIFT_CLIENT.md:79 ("full sub-API parity … match" incl. `.session`); reference/js-bao-wss-client/api/README.md:2929 shows JS `client.session.get()` typed only | Note Swift `session.get()` returns untyped dict, no `SessionInfo` struct |

---

# Appendix A — Stale / invalid existing records (close or fix, independent of docs)

The sweep verified open issues + parity prose against current code. These are wrong:

- **#846** `getOrCreateWithAlias` "missing" — STALE; Swift implements it (`DocumentsAPI.swift:560`). Only typedness residual.
- **#847** MeAPI missing `ownedDocuments`/`sharedDocuments` — STALE; both exist (`MeAPI.swift:67,93`). Remaining = #938 + me D3/D4/D5.
- **#953** `invitations.getAcceptToken` missing — STALE/INVALID; method exists in neither client (renamed to `get()` under #496). Same as the sharing doc bug.
- **#946 / #955** cite `TypedModel.swift:84` — DELETED in #918. Refreshed form is model-surface D1.
- **#918** partly satisfied — transparent `Model.query()` facade now exists; only return-shape gap (= #946 / model-surface D1) remains.
- **Systemic** — `surfaces/api.md` + `manifest/api-methods.json` mark dozens of methods "✅ Parity" / `"status":"match"` on **name only**, hiding all the typedness/shape/behavior drift in this crosswalk.

# Appendix B — Documented-intentional (exempt, justification linked)

Not drift — a written justification exists, so these are **not** doc gaps:

- **auth passkeys** absent — `swift-client/docs/exclusions-v1.md:81-91` (iOS uses Apple WebAuthn; native proposal #929). `webauthn-large-blob` — `exclusions-v1.md:93-95` (permanent).
- **workflows** Swift-only `runAndApply`/`awaitRun`/`recheckPendingRuns`/`deliverPendingApplies`/`undefine` — `surfaces/api.md:342-346` (Swift-only orchestration, not a JS gap).
- **databases** `getMetadata` absent — `api.md:127` (deprecated alias of `getCelContext`, which Swift ships).
- **model-surface** argument-less `subscribe` callback; `offset` pagination; substring-operator error semantics — `query.md:23-30`, `DocumentFilter.swift:46-48` (v1.1 polish).
- **codegen-conventions** struct-vs-class generated body; two Swift TOML parsers — `codegen.md` (the parser-parity claim is now *partially stale*, see codegen D1/D2).

# Appendix C — Looming: PR #923 (Swift "one-model" API)

OPEN, unmerged; docs pin predates it (still ships `TypedModel.swift`), so docs are accurate **today**. On merge + pin bump, the `TypedModel<T>` / `.dynamic.{queryPaged,aggregate,count,upsert}` / per-doc-write surface goes stale across `working-with-documents.md`, `swift-client.md`, the Swift agent guide, the `.swift.md` documents guide, and ~12 Swift example files. Companion docs rewrite drafted in **primitive-docs PR #75**. Several model-surface findings here (D1 return shape, D4 SaveOptions) are what #923 resolves.

# How to verify any row yourself

```bash
JS=/Users/spagrhetti/primitive/js-bao-wss ; DOCS=/Users/spagrhetti/primitive/primitive-docs
# 1. Read the finding detail (full both-client path:line + excerpt + proposed fix):
sed -n '/### D3/,/### D4/p' $JS/swift-client/docs/parity/sweep/<surface>.md
# 2. Is it in the docs? (method name, behavior, or the type it should return)
grep -rn "<methodName>" $DOCS/docs/getting-started $DOCS/examples $DOCS/guides/latest
# 3. Is the drift already caveated? look for a JS-only banner near the hit:
grep -n "JavaScript-only\|JS-only\|Loose return" $DOCS/docs/getting-started/<page>.md
# 4. Existing issue? 
gh issue list --repo Primitive-Labs/js-bao-wss --search "<keyword>" --state all
```
