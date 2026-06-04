# document-blob — `client.document(id).blobs()`

Per-document blob context: upload, list, read, and delete file attachments scoped
to a single document. Access follows the document's permissions. Get the context
with `client.document(id).blobs()` (JS) or `client.documents.blobs(documentId:)`
(Swift).

## upload(source, options?)

Upload a blob attached to the document, hashing and deduplicating automatically.

::: danger Swift parity gap
JS accepts `File | Blob | Uint8Array | ArrayBuffer` and the `retainLocal` option;
Swift's `upload(data:options:)` takes only `Data` (filename/contentType must be
passed explicitly) and has no `retainLocal` (sweep blob D12). The `Data`-only source
is web-vs-native by design, but `retainLocal` has no Swift equivalent and is not
tracked by an issue.
:::

::: code-group
<<< ./snippets/document-blob/upload.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/upload.swift#example{swift} [Swift]
:::

## list(params?)

List blobs attached to this document.

::: code-group
<<< ./snippets/document-blob/list.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/list.swift#example{swift} [Swift]
:::

## get(blobId)

Retrieve metadata for a single blob.

::: code-group
<<< ./snippets/document-blob/get.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/get.swift#example{swift} [Swift]
:::

## downloadUrl(blobId, params?)

Build a direct, authenticated download URL for a blob (synchronous).

::: danger Swift parity gap
JS accepts both `disposition` and `attachmentFilename`. Swift's
`downloadUrl(blobId:disposition:)` supports `disposition` only — there is no way to
override the download filename from the Swift client (sweep blob D-downloadUrl; not
tracked by an issue).
:::

::: code-group
<<< ./snippets/document-blob/download-url.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/download-url.swift#example{swift} [Swift]
:::

## read(blobId, options?)

Read blob content from the cache or server. Pass `force: true` (Swift) /
`forceRedownload: true` (JS) to bypass the local cache and re-download.

::: tip Divergent shape
JS's `read` takes an `options` object (`as: "uint8array" | "arrayBuffer" | "blob"
| "text"`) and returns the requested format. Swift's base `read(blobId:)` returns
raw `Data`; typed overloads cover the common cases — see
[`read(as:)`](#read-blobid-as-force) below.
:::

::: code-group
<<< ./snippets/document-blob/read.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/read.swift#example{swift} [Swift]
:::

## read(blobId, as:, force?)

Read a blob and decode it in one call (#957). Swift offers two typed overloads:
`read(blobId:as: String.self)` decodes UTF-8 text, and
`read(blobId:as: T.self)` JSON-decodes into any `Decodable`. JS expresses the
text form via `read(blobId, { as: "text" })` and JSON-parses for typed shapes.

::: code-group
<<< ./snippets/document-blob/read-as.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/read-as.swift#example{swift} [Swift]
:::

## delete(blobId)

Delete a blob from the document. Swift's `delete` now **evicts the blob from the
local cache** (#965), so a subsequent `read` won't serve the deleted blob stale.

::: warning Upload-queue side effects are JS-only
JS `delete` additionally cancels any queued upload for the blob and emits
`queue-drained`. Swift has no upload-queue facade, so those queue-specific side
effects don't apply (part of the by-design upload-queue exclusion, sweep blob D13).
:::

::: code-group
<<< ./snippets/document-blob/delete-x.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/delete-x.swift#example{swift} [Swift]
:::

## uploadFile(source, options?)

Upload a file and queue it for background transfer when the upload queue is active.

::: danger No Swift equivalent
JavaScript-only — the Swift document-blob context exposes only `upload(data:)`, with
no separate queued-upload entry point. Part of the upload-queue facade that is absent
on Swift (sweep blob D13; not tracked by an issue).
:::

<<< ./snippets/document-blob/upload-file.ts#example{ts} [JavaScript]

## proxyUrl(blobId, options?)

Build a service-worker-proxied URL for a blob (useful for inline display).

::: danger No Swift equivalent
JavaScript-only — relies on a browser service worker, which has no Swift counterpart
(web-only by platform constraint).
:::

<<< ./snippets/document-blob/proxy-url.ts#example{ts} [JavaScript]

## hasServiceWorkerControl()

Report whether a service worker is registered and controlling blob proxy requests.

::: danger No Swift equivalent
JavaScript-only — service-worker-specific (web-only by platform constraint).
:::

<<< ./snippets/document-blob/has-service-worker-control.ts#example{ts} [JavaScript]

## prefetch(blobIds, options?)

Pre-download multiple blobs into the local cache for offline access (#957).
Best-effort: per-blob failures are swallowed. `concurrency` defaults to 2.

::: code-group
<<< ./snippets/document-blob/prefetch.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/prefetch.swift#example{swift} [Swift]
:::

## uploads()

Return the current status of all tracked uploads for this document.

::: danger No Swift equivalent
JavaScript-only — the upload-queue facade is not re-exported on the Swift
document-blob context (sweep blob D13; not tracked by an issue).
:::

<<< ./snippets/document-blob/uploads.ts#example{ts} [JavaScript]

## pauseUpload(blobId)

Pause an in-progress upload by blob ID.

::: danger No Swift equivalent
JavaScript-only — upload-queue control, part of the queue facade absent on Swift
(sweep blob D13; not tracked by an issue).
:::

<<< ./snippets/document-blob/pause-upload.ts#example{ts} [JavaScript]

## resumeUpload(blobId)

Resume a paused upload by blob ID.

::: danger No Swift equivalent
JavaScript-only — upload-queue control, part of the queue facade absent on Swift
(sweep blob D13; not tracked by an issue).
:::

<<< ./snippets/document-blob/resume-upload.ts#example{ts} [JavaScript]

## pauseAll()

Pause all in-progress uploads for this document.

::: danger No Swift equivalent
JavaScript-only — upload-queue control, part of the queue facade absent on Swift
(sweep blob D13; not tracked by an issue).
:::

<<< ./snippets/document-blob/pause-all.ts#example{ts} [JavaScript]

## resumeAll()

Resume all paused uploads for this document.

::: danger No Swift equivalent
JavaScript-only — upload-queue control, part of the queue facade absent on Swift
(sweep blob D13; not tracked by an issue).
:::

<<< ./snippets/document-blob/resume-all.ts#example{ts} [JavaScript]
