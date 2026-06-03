# document-blob — `client.document(id).blobs()`

Per-document blob context: upload, list, read, and delete file attachments scoped
to a single document. Access follows the document's permissions. Get the context
with `client.document(id).blobs()` (JS) or `client.documents.blobs(documentId:)`
(Swift).

## upload(source, options?)

Upload a blob attached to the document, hashing and deduplicating automatically.

::: tip Divergent shape
JS accepts `File | Blob | Uint8Array | ArrayBuffer` and the `retainLocal` option;
Swift's `upload(data:options:)` takes only `Data` (filename/contentType must be
passed explicitly) and has no `retainLocal` ([#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965)).
:::

::: code-group
<<< ./snippets/document-blob/upload.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/upload.swift#example{swift} [Swift]
:::

## list(params?)

List blobs attached to this document.

::: warning Swift parity gap
JS returns a typed `BlobListResult<T>` (`{ items, cursor? }`) and accepts a
`cursor` for pagination. Swift returns an untyped `[[String: Any]]` and drops the
cursor entirely — callers stringly-key into each dict and there is no way to page
(sweep D7, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), [#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965)).
:::

::: code-group
<<< ./snippets/document-blob/list.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/list.swift#example{swift} [Swift]
:::

## get(blobId)

Retrieve metadata for a single blob.

::: warning Swift parity gap
JS returns a typed `T` / `BlobInfo` (blob metadata). Swift returns an untyped `[String: Any]`,
so callers stringly-key into the dict (sweep D8, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), [#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965)).
:::

::: code-group
<<< ./snippets/document-blob/get.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/get.swift#example{swift} [Swift]
:::

## downloadUrl(blobId, params?)

Build a direct, authenticated download URL for a blob (synchronous).

::: tip Divergent shape
JS accepts both `disposition` and `attachmentFilename`. Swift's
`downloadUrl(blobId:disposition:)` supports `disposition` only
([#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965)).
:::

::: code-group
<<< ./snippets/document-blob/download-url.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/download-url.swift#example{swift} [Swift]
:::

## read(blobId, options?)

Read blob content from the cache or server.

::: tip Divergent shape
JS's `read` takes an `options` object (`as: "uint8array" | "arrayBuffer" | "blob"
| "text"`, plus `forceRedownload`) and returns the requested format. Swift's
`read(blobId:)` always returns raw `Data` — no format options
([#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957)).
:::

::: code-group
<<< ./snippets/document-blob/read.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/read.swift#example{swift} [Swift]
:::

## delete(blobId)

Delete a blob from the document.

::: warning Swift parity gap
JS returns a typed `{ deleted: boolean }`. Swift returns an untyped
`[String: Any]` (sweep D9, [#954](https://github.com/Primitive-Labs/js-bao-wss/issues/954), [#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965)).
:::

::: warning Swift parity gap
Beyond the result shape, JS `delete` also evicts the blob's local cache, cancels any
queued upload for it, and emits `queue-drained`. Swift's `delete` does none of this —
a deleted blob can be served stale from the local cache, and a delete issued mid-upload
won't cancel the in-flight transfer (sweep D10, [#965](https://github.com/Primitive-Labs/js-bao-wss/issues/965)).
:::

::: code-group
<<< ./snippets/document-blob/delete-x.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/delete-x.swift#example{swift} [Swift]
:::

## uploadFile(source, options?)

Upload a file and queue it for background transfer when the upload queue is active.

::: warning No Swift equivalent
JavaScript-only — the Swift document-blob context exposes only `upload(data:)`, with
no separate queued-upload entry point ([#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957)).
:::

<<< ./snippets/document-blob/upload-file.ts#example{ts} [JavaScript]

## proxyUrl(blobId, options?)

Build a service-worker-proxied URL for a blob (useful for inline display).

::: warning No Swift equivalent
JavaScript-only — relies on a browser service worker, which has no Swift counterpart
([#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957)).
:::

<<< ./snippets/document-blob/proxy-url.ts#example{ts} [JavaScript]

## hasServiceWorkerControl()

Report whether a service worker is registered and controlling blob proxy requests.

::: warning No Swift equivalent
JavaScript-only — service-worker-specific ([#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957)).
:::

<<< ./snippets/document-blob/has-service-worker-control.ts#example{ts} [JavaScript]

## prefetch(blobIds, options?)

Pre-download multiple blobs into the local cache for offline access.

::: warning No Swift equivalent
JavaScript-only — the Swift document-blob context doesn't expose `prefetch` yet
([#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957)).
:::

<<< ./snippets/document-blob/prefetch.ts#example{ts} [JavaScript]

## uploads()

Return the current status of all tracked uploads for this document.

::: warning No Swift equivalent
JavaScript-only — the upload-queue facade is not re-exported on the Swift
document-blob context ([#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957)).
:::

<<< ./snippets/document-blob/uploads.ts#example{ts} [JavaScript]

## pauseUpload(blobId)

Pause an in-progress upload by blob ID.

::: warning No Swift equivalent
JavaScript-only — upload-queue control ([#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957)).
:::

<<< ./snippets/document-blob/pause-upload.ts#example{ts} [JavaScript]

## resumeUpload(blobId)

Resume a paused upload by blob ID.

::: warning No Swift equivalent
JavaScript-only — upload-queue control ([#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957)).
:::

<<< ./snippets/document-blob/resume-upload.ts#example{ts} [JavaScript]

## pauseAll()

Pause all in-progress uploads for this document.

::: warning No Swift equivalent
JavaScript-only — upload-queue control ([#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957)).
:::

<<< ./snippets/document-blob/pause-all.ts#example{ts} [JavaScript]

## resumeAll()

Resume all paused uploads for this document.

::: warning No Swift equivalent
JavaScript-only — upload-queue control ([#957](https://github.com/Primitive-Labs/js-bao-wss/issues/957)).
:::

<<< ./snippets/document-blob/resume-all.ts#example{ts} [JavaScript]
