# events — `client.on`

Subscribe to real-time client events. In JavaScript you call `client.on("<event>", (payload) => { … })`;
in Swift you call `client.events.on(.<event>) { (event: PayloadType) in … }` and the returned
`EventSubscription` cancels the listener on `.cancel()` or when it's deallocated. Unsubscribe in JS
with `client.off("<event>", handler)`.

Events are grouped by area below. The event **name** surface is reconciled across both clients, but
several **payloads** diverge field-for-field — those carry a `::: tip Divergent shape` note.

## Documents

### documentLoaded

Fires when a document finishes loading from the local store or a fresh server sync.

::: code-group
<<< ./snippets/events/document-loaded.ts#example{ts} [JavaScript]
<<< ./snippets/events/document-loaded.swift#example{swift} [Swift]
:::

### documentOpened

Fires when a document is opened (subscribed to) by this client.

::: code-group
<<< ./snippets/events/document-opened.ts#example{ts} [JavaScript]
<<< ./snippets/events/document-opened.swift#example{swift} [Swift]
:::

### documentClosed

Fires when a document is closed (unsubscribed) by this client.

::: code-group
<<< ./snippets/events/document-closed.ts#example{ts} [JavaScript]
<<< ./snippets/events/document-closed.swift#example{swift} [Swift]
:::

### documentMetadataChanged

Fires when a document's metadata (title, tags, etc.) is created, updated, evicted, or deleted.

::: tip Divergent shape
The `source` vocabulary differs: JS reports `"local" | "server" | "idb"`, Swift reports
`"local" | "remote"` (sweep events D6). `source` is also **optional** in Swift (`event.source?`)
but always present in JS, so cross-platform code must handle a nil `source`. Both deliver
`documentId`, `action`, `metadata`, and `changedFields`.
:::

::: code-group
<<< ./snippets/events/document-metadata-changed.ts#example{ts} [JavaScript]
<<< ./snippets/events/document-metadata-changed.swift#example{swift} [Swift]
:::

### permission

Fires when this client's permission level on a document changes.

::: tip Divergent shape
`permission` is a plain string in JS (`payload.permission`) but a typed enum in Swift — read its
`.rawValue` to get the wire string (`event.permission.rawValue`).
:::

::: code-group
<<< ./snippets/events/permission.ts#example{ts} [JavaScript]
<<< ./snippets/events/permission.swift#example{swift} [Swift]
:::

## Blobs

### blobs:upload-progress

Fires repeatedly as a queued blob upload makes progress.

::: tip Divergent shape
JS sends the full queue-item record (12 fields incl. `queueId`, `filename`, `contentType`, `status`,
`attempts`, `numBytes`). Swift sends a 4-field byte-progress view (`documentId`, `blobId`,
`bytesTransferred`, `totalBytes`) — note the byte fields are renamed (`numBytes`→`bytesTransferred`/
`totalBytes`) and the other 8 fields are dropped (sweep events D2).
:::

::: code-group
<<< ./snippets/events/blobs-upload-progress.ts#example{ts} [JavaScript]
<<< ./snippets/events/blobs-upload-progress.swift#example{swift} [Swift]
:::

### blobs:upload-completed

Fires when a queued blob upload finishes successfully.

::: tip Divergent shape
Swift carries only `documentId`, `blobId`, `numBytes`; JS additionally sends 5 fields — `queueId`,
`filename`, `contentType`, `attempts`, `retainLocal`, `updatedAt` (sweep events D3).
:::

::: code-group
<<< ./snippets/events/blobs-upload-completed.ts#example{ts} [JavaScript]
<<< ./snippets/events/blobs-upload-completed.swift#example{swift} [Swift]
:::

### blobs:upload-failed

Fires when a queued blob upload fails (and may still retry).

::: tip Divergent shape
JS sends `lastError?` (optional) plus `queueId`/`filename`/`contentType`/`attempts`/`nextAttemptAt`/
`updatedAt`; Swift renames it to a non-optional `error` (optionality flip) and drops the other 6
fields, keeping only `documentId`, `blobId`, `willRetry` (sweep events D4).
:::

::: code-group
<<< ./snippets/events/blobs-upload-failed.ts#example{ts} [JavaScript]
<<< ./snippets/events/blobs-upload-failed.swift#example{swift} [Swift]
:::

## Workflows

### workflowStarted

Fires when a workflow run starts.

::: tip Divergent shape
Swift's payload carries only `workflowKey` and `runId` (2 of 7 fields); JS additionally sends
`workflowId`, `runKey`, `instanceId`, `contextDocId`, and `meta` (sweep events D1).
:::

::: code-group
<<< ./snippets/events/workflow-started.ts#example{ts} [JavaScript]
<<< ./snippets/events/workflow-started.swift#example{swift} [Swift]
:::

### workflowStatus

Fires when a workflow run reaches a terminal status (`completed` / `failed` / `terminated`).

::: code-group
<<< ./snippets/events/workflow-status.ts#example{ts} [JavaScript]
<<< ./snippets/events/workflow-status.swift#example{swift} [Swift]
:::

## Sync

### sync

Fires when a document's sync state with the server flips.

::: code-group
<<< ./snippets/events/sync.ts#example{ts} [JavaScript]
<<< ./snippets/events/sync.swift#example{swift} [Swift]
:::

### syncPerf

Fires with sync-timing telemetry for a document.

::: tip Divergent shape
The payloads diverge entirely: JS sends `timings` / `clientTimings` (`Record<string, any>` maps),
Swift sends a single `phase` / `elapsedMs` pair (sweep events D5).
:::

::: code-group
<<< ./snippets/events/sync-perf.ts#example{ts} [JavaScript]
<<< ./snippets/events/sync-perf.swift#example{swift} [Swift]
:::

## Awareness

### awareness

Fires when collaborator awareness (presence / cursors) changes for a document.

::: tip Divergent shape
JS delivers **deltas** — `added` / `updated` / `removed` arrays of client IDs. Swift delivers a full
**snapshot** in `states` (`[[String: Any]]`) (sweep events D7).
:::

::: code-group
<<< ./snippets/events/awareness.ts#example{ts} [JavaScript]
<<< ./snippets/events/awareness.swift#example{swift} [Swift]
:::

## Cache

### cacheUpdated

Fires when an internal KV cache entry (e.g. the `me` record) refreshes from the server.

Now on both clients — Swift fires `.cacheUpdated` on network refresh with a typed
`CacheUpdatedEvent` ([#1042](https://github.com/Primitive-Labs/js-bao-wss/issues/1042)).

::: code-group
<<< ./snippets/events/cache-updated.ts#example{ts} [JavaScript]
<<< ./snippets/events/cache-updated.swift#example{swift} [Swift]
:::

### cacheUpdateFailed

Fires when an internal KV cache entry fails to refresh from the server.

::: code-group
<<< ./snippets/events/cache-update-failed.ts#example{ts} [JavaScript]
<<< ./snippets/events/cache-update-failed.swift#example{swift} [Swift]
:::
