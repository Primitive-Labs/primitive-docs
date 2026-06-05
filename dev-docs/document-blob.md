# document-blob — `client.document(id).blobs()`

Per-document blob context: upload, list, read, and delete file attachments scoped
to a single document. Access follows the document's permissions. Get the context
with `client.document(id).blobs()` (JS) or `client.documents.blobs(documentId:)`
(Swift).

## upload(source, options?)

Upload a blob attached to the document, hashing and deduplicating automatically.

::: tip Source type differs by platform
Swift's `upload(data:options:)` now supports the `retainLocal` option (defaults to
`true`, matching JS). The only remaining difference is the source type: JS accepts
`File | Blob | Uint8Array | ArrayBuffer`, while Swift takes raw `Data` with
`filename`/`contentType` passed explicitly — web-vs-native by design.
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

Build a direct, authenticated download URL for a blob (synchronous). Both clients
accept `disposition` and `attachmentFilename`; the filename is RFC 5987-encoded
into the URL.

::: code-group
<<< ./snippets/document-blob/download-url.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/download-url.swift#example{swift} [Swift]
:::

## read(blobId, options?)

Read blob content from the cache or server. Pass `force: true` (Swift) /
`forceRedownload: true` (JS) to bypass the local cache and re-download, and
`disposition` to serve `inline` vs `attachment`.

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

Delete a blob from the document. Both clients **evict the blob from the local
cache** (so a subsequent `read` won't serve it stale), **cancel any queued upload**
for that blob, and emit `queue-drained` once the queue empties.

::: code-group
<<< ./snippets/document-blob/delete-x.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/delete-x.swift#example{swift} [Swift]
:::

## uploadFile(source, options?)

Upload a file and queue it for background transfer when the immediate upload can't
complete. Like `upload`, but returns the narrowed `{ blobId, numBytes,
bytesTransferred }` queue shape.

::: code-group
<<< ./snippets/document-blob/upload-file.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/upload-file.swift#example{swift} [Swift]
:::

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

Return the current status of all tracked uploads for this document (newest first),
scoped to this document.

::: tip App-wide variants
The same upload-queue verbs (`uploads`, `pauseUpload`, `resumeUpload`,
`pauseAllUploads`, `resumeAllUploads`, `setUploadConcurrency`) also live on
`client.documents` with an optional `documentId:` — omit it to operate across
**all** documents ([#1038](https://github.com/Primitive-Labs/js-bao-wss/issues/1038)).
:::

::: code-group
<<< ./snippets/document-blob/uploads.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/uploads.swift#example{swift} [Swift]
:::

## pauseUpload(blobId)

Pause an in-progress upload by blob ID. Returns `true` if a matching, pausable
upload for this document was paused.

::: code-group
<<< ./snippets/document-blob/pause-upload.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/pause-upload.swift#example{swift} [Swift]
:::

## resumeUpload(blobId)

Resume a paused upload by blob ID. Returns `true` if a matching, paused upload for
this document was resumed.

::: code-group
<<< ./snippets/document-blob/resume-upload.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/resume-upload.swift#example{swift} [Swift]
:::

## pauseAll()

Pause all in-progress uploads for this document.

::: code-group
<<< ./snippets/document-blob/pause-all.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/pause-all.swift#example{swift} [Swift]
:::

## resumeAll()

Resume all paused uploads for this document.

::: code-group
<<< ./snippets/document-blob/resume-all.ts#example{ts} [JavaScript]
<<< ./snippets/document-blob/resume-all.swift#example{swift} [Swift]
:::
