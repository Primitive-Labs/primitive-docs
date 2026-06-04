# Swift API changes → docs to update

Swift client on `js-bao-wss` @ `js-parity-jun-3`. The **#918 model-surface** row
is still being built by an agent — expect it to shift.

| Changed (Swift client) | Issue | Docs to update |
|---|---|---|
| 21 namespaces typed (`[String:Any]` → typed in/out) | #954 | All Swift examples in `docs/getting-started/*.md` + `guides/latest/*.swift.md` — untyped `result["…"]` → typed result types |
| New `client.analytics` namespace + session/per-feature auto-events | #951/#963 | `docs/getting-started/analytics.md`, `guides/latest/AGENT_GUIDE_TO_PRIMITIVE_ANALYTICS.swift.md` |
| New typed `client.auth` namespace (magic-link, OTP, getAuthConfig, logout, offline-grant) | #964 | `docs/getting-started/authentication.md`, `…_AUTHENTICATION.swift.md`. Native passkeys/OAuth still deferred (#928/#929); logout cookie-clear + offline biometric default still off |
| `databases.subscribe` realtime change subscriptions | #952 | `docs/getting-started/working-with-databases.md`, `…_DATABASES.swift.md` |
| `documents.create` local-first + pending-create surface (`listPendingCreates`/`commitOfflineCreate`/`cancelPendingCreate`/`evict`/`evictAll`) | #852/#673 | `docs/getting-started/working-with-documents.md`, `…_DOCUMENTS.swift.md` |
| `includesWrites`/`inSync` now async (`stateVectorCheck`, `timeoutMs`); `isSynced` sync | — | `…_DOCUMENTS.swift.md` sync section |
| doc-blob `prefetch` / typed `read(as:)` / delete-eviction + upload-queue (`pause`/`resume`/`uploads`) | #957/#965 | `docs/getting-started/blobs-and-files.md`, `…_BLOBS.swift.md` |
| `me.ownedDocuments`/`sharedDocuments` now offline-first | #938 | `docs/getting-started/working-with-documents.md` (prose) |
| `workflows.runSync` + `WorkflowStartedEvent` payload aligned to JS | #956/#996 | `docs/getting-started/workflows.md`, `…_WORKFLOWS.swift.md` |
| `databases.importCsv` (typed) | #962 | `docs/getting-started/working-with-databases.md` CSV section |
| Codegen `--check`, `GeneratedModels` barrel (`.all`/`register(on:)`), relationship accessors | #995/#944 | `docs/getting-started/choosing-your-data-model.md`, `…_DATA_MODELING.swift.md` |
| **Model-surface: `Model.save()` (replaces create/update), `Model.query/find/count/delete/aggregate/subscribe`; `BaoModel`+`TypedModel` deleted** _(agent building now)_ | #918 | `docs/reference/**` (regenerate — `BaseModel` reference is stale), `docs/getting-started/choosing-your-data-model.md`, `…_DATA_MODELING.swift.md` |

Also: `examples/workflows/workflow-start.swift` still uses untyped `started["runKey"]` against the now-typed `StartWorkflowResult` — `compile:examples` fails there until migrated (part of #954).
