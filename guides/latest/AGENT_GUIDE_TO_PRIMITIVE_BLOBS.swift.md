# Agent Guide to Primitive Blob Storage

Guidelines for AI agents implementing file storage in Primitive apps.

## Bucket operations (JavaScript + Swift)

The bucket-blob client calls in both languages, compiled against the real clients. The API is **flat** (`client.blobBuckets.upload(bucketIdOrKey, …)`), not a `.bucket(key)` builder, and accepts `tags: string[]` — there is no arbitrary `metadata` field on upload.

### Upload

```swift
  let result = try await client.blobBuckets.upload(
    bucketIdOrKey: "avatars",
    data: data,
    filename: "alice.jpg",
    contentType: "image/jpeg",
    tags: ["profile"]
  )
  let blobId = result["blobId"] as? String
```

### Read (signed URL / download)

```swift
  // Signed URL (for <img> tags, etc.)
  let signed = try await client.blobBuckets.getSignedUrl(
    bucketIdOrKey: "avatars", blobId: blobId, expiresInSeconds: 3600
  )
  let url = signed["url"] as? String

  // Or download the bytes directly
  let bytes = try await client.blobBuckets.download(bucketIdOrKey: "avatars", blobId: blobId)
```

### List / metadata / delete

```swift
  // List blobs in the bucket
  let page = try await client.blobBuckets.list(bucketIdOrKey: "avatars", limit: 50)
  let items = page["items"] as? [[String: Any]] ?? []

  // One blob's metadata
  let meta = try await client.blobBuckets.getMetadata(bucketIdOrKey: "avatars", blobId: blobId)

  // Delete a blob
  _ = try await client.blobBuckets.delete(bucketIdOrKey: "avatars", blobId: blobId)
```

### Bucket admin (create / list / get / delete)

Admin/owner only. Deleting a bucket cascades to every blob inside it.

```swift
  _ = try await client.blobBuckets.createBucket(params: [
    "bucketKey": "uploads",
    "name": "User uploads",
    "ttlTier": "28d",
    "accessPolicy": "authenticated",
  ])

  let buckets = try await client.blobBuckets.listBuckets()
  let bucket = try await client.blobBuckets.getBucket(bucketIdOrKey: "uploads")

  _ = try await client.blobBuckets.deleteBucket(bucketIdOrKey: "uploads")  // cascades to all blobs
```

## Document-scoped blob operations (JavaScript + Swift)

Context accessor differs: `client.document(documentId).blobs()` (JS) vs `client.documents.blobs(documentId:)` (Swift). `prefetch`, `proxyUrl`, `uploads()`/pause/resume, and the `read(blobId, { as })` format options are JS-only.

### Upload

```swift
  let blobs = client.documents.blobs(documentId: documentId)
  let result = try await blobs.upload(
    data: data,
    options: BlobUploadSourceOptions(filename: "notes.txt", contentType: "text/plain")
  )
  let blobId = result.blobId
```

### Upload with disposition

`disposition` is stored on the blob (sent as `X-Blob-Disposition`). `retainLocal` (default `true`; set `false` to drop local bytes once the server confirms) is a JS-only option.

```swift
  let data = Data("hello blob".utf8)
  let result = try await blobs.upload(
    data: data,
    options: BlobUploadSourceOptions(
      filename: "hello.txt",
      contentType: "text/plain",
      disposition: .attachment  // or .inline
    )
  )
  let blobId = result.blobId
  let numBytes = result.numBytes
```

### List / URL / read

```swift
  let blobs = client.documents.blobs(documentId: documentId)

  let list = try await blobs.list()
  let url = blobs.downloadUrl(blobId: blobId)          // synchronous, authenticated
  let bytes = try await blobs.read(blobId: blobId)
```

### List / metadata / delete

```swift
  let blobs = client.documents.blobs(documentId: documentId)

  let list = try await blobs.list(limit: 50)
  let meta = try await blobs.get(blobId: blobId)
  _ = try await blobs.delete(blobId: blobId)
```

## Overview

Two kinds of blob storage:

**Document-scoped blobs** — binary files attached to a specific document. Access follows the document's permissions; includes offline caching, IndexedDB-backed upload queue, and a service-worker proxy for `<img>`/`<video>`. **Cap: 10 MB per blob.**

```typescript
const blobs = client.document(documentId).blobs();
```

**Blob buckets** — general-purpose storage outside any document context. Each bucket has its own access policy, TTL tier, and supports time-limited signed URLs. **Cap: 100 MB per blob.**

```typescript
// There is NO bucket() context object. The bucket key/ID is a positional arg.
await client.blobBuckets.upload("avatars", { filename, contentType, data });
await client.blobBuckets.getSignedUrl("avatars", blobId, 3600);
```

**Decision rule:** use document-scoped blobs when the file's lifetime and access naturally match a document's. Use a bucket for avatars, workflow outputs, public assets, anonymous reads via signed URLs, or anything that should live outside any specific document.

---

# Part 1 — Document-Scoped Blobs

## Uploading

`upload` accepts `File | Blob | Uint8Array | ArrayBuffer` (JS) or `Data` (Swift). SHA-256 is computed client-side and used for server-side dedup. See **Upload with disposition** above for the full options form. The download endpoint chooses `Content-Disposition` from the `?disposition=` query param (default `attachment`), not from the upload-time value — pass `disposition` explicitly to `downloadUrl`/`proxyUrl` when serving inline.

### From a file input (browser, JS-only)

```typescript
const file = (document.querySelector('input[type="file"]') as HTMLInputElement).files![0];

// File objects are accepted directly. If filename/contentType are omitted,
// they default to file.name and file.type.
const { blobId } = await client.document(documentId).blobs().upload(file);
```

### Don't do this

```typescript
// DON'T: manually convert File to ArrayBuffer just to upload it.
const buf = await file.arrayBuffer();
await blobs.upload(buf, { filename: file.name, contentType: file.type });

// DON'T: try to upload >10 MB to document-scoped blobs. The server returns 413.
// Use a blob bucket instead (100 MB cap).
```

### Idempotent re-upload

Uploading the same `blobId` twice with **identical** `sha256` and `size` returns 200 with `bytesTransferred: 0` — the server keeps the existing object, so retries from a flaky network are free. Uploading the same `blobId` with **different** bytes (different sha256 or size) returns 409; pick a new `blobId` instead of overwriting. This dedup behavior is what makes `retryWithBackoff`-style upload loops safe.

### `uploadFile` vs `upload` (JS-only)

Both call the same code path. `uploadFile` returns a slightly trimmed result (`{ blobId, numBytes, bytesTransferred? }`). Prefer `upload`.

---

## Listing

See **List / metadata / delete** above for the basic call. To page through results, follow the cursor:

```typescript
const page1 = await blobs.list({ limit: 50 });
for (const b of page1.items) {
  console.log(b.blobId, b.filename, b.contentType, b.numBytes, b.sha256, b.createdAt);
}
if (page1.cursor) {
  const page2 = await blobs.list({ cursor: page1.cursor });
}
```

`cursor` is an opaque pagination token; only present when more results exist. (Swift `list(limit:)` returns the items array directly and does not expose the cursor.)

---

## Get metadata

See **List / metadata / delete** above (`blobs.get(blobId)` / Swift `blobs.get(blobId:)`).

```typescript
const meta = await blobs.get(blobId);
// { blobId, filename, contentType, numBytes, sha256, createdAt, ... }
```

---

## Downloading

### Download URL (authenticated)

The basic call is shown in **List / URL / read** above. JS accepts extra params; Swift's `downloadUrl(blobId:disposition:)` accepts only `disposition`.

```typescript
const url = blobs.downloadUrl(blobId, {
  disposition: "attachment",        // or "inline"
  attachmentFilename: "report.pdf", // optional override (RFC 5987-encoded) — JS-only
});
// Synchronous; returns a string. Authenticated via the user's session/cookie
// against the API origin. Works in <a href={url} download> or window.location.
```

### Read content into memory

`read` is shown in **List / URL / read** above. In JS the return format is selectable via `{ as }`; Swift's `read(blobId:)` always returns `Data`.

```typescript
const text  = await blobs.read(blobId, { as: "text" });
const buf   = await blobs.read(blobId, { as: "arrayBuffer" });
const blob  = await blobs.read(blobId, { as: "blob" });
const bytes = await blobs.read(blobId, { as: "uint8array" }); // default

// Bypass the local Cache API + IndexedDB cache and re-fetch from the server.
const fresh = await blobs.read(blobId, { as: "text", forceRedownload: true });
```

`read` checks the cache first; on a miss it fetches from the server and writes the response into the cache. When offline (`networkMode === "offline"`) and the cache is empty, it throws `"Blob cache unavailable while offline"`.

### Range requests and conditional GETs

The document blob download endpoint supports two HTTP behaviors useful when streaming media or revalidating cached bytes:

- **Range requests.** Send `Range: bytes=START-END` and the server replies with `206 Partial Content` and the requested slice. Out-of-range requests return `416`. This is what `<video>`/`<audio>` elements use to seek; you usually don't issue these manually, but if you build a custom player it works as expected.
- **Conditional GET.** The server emits an `ETag` (the blob's sha256). Send `If-None-Match: <etag>` on subsequent requests and the server returns `304 Not Modified` with no body when the bytes are unchanged. The browser's HTTP cache honors this automatically when you load the same `downloadUrl(...)` more than once.

Both behaviors are on the document blob path only. Bucket blobs go through signed URLs straight to the object store, which has its own range/etag semantics handled by the storage layer.

---

## Deleting

See **List / metadata / delete** above.

```typescript
const { deleted } = await blobs.delete(blobId); // { deleted: true }
```

Also cancels any in-flight upload for the same `blobId` and clears local bytes.

---

## Offline & the upload queue (JS-only)

The upload queue is keyed by user identity. It hydrates from IndexedDB on sign-in, retries with exponential backoff (2s base, 60s max), and persists across page reloads. The Swift client does not expose the upload queue, offline network mode, or prefetch.

### Upload while offline

```typescript
await client.setNetworkMode("offline");

// Bytes are written to the local Cache API immediately and queued.
// upload() resolves without waiting for the network (the result includes
// bytesTransferred: 0 to indicate nothing was transferred yet).
const { blobId } = await blobs.upload(data, {
  filename: "draft.txt",
  contentType: "text/plain",
});
```

### Read cached blobs offline

```typescript
// Works for blobs that were previously uploaded or downloaded on this device/user.
const text = await blobs.read(blobId, { as: "text" });
```

### Prefetch into the cache

```typescript
await blobs.prefetch([blobId1, blobId2, blobId3], {
  concurrency: 4,        // default 2, capped at blobIds.length
  forceRedownload: false,
});
```

Errors per blob are logged and swallowed — `prefetch` resolves once all attempts complete, regardless of individual failures. Don't rely on it to surface errors.

### Coming back online

```typescript
await client.setNetworkMode("online");
// Queue processing resumes automatically. Listen for "blobs:queue-drained" to know when done.
```

---

## Queue management (JS-only)

```typescript
// Inspect what's queued for this document
const tasks = blobs.uploads();
// Each task: { queueId, blobId, filename, contentType, numBytes,
//              status: "pending" | "uploading" | "uploaded" | "paused",
//              attempts, nextAttemptAt, retainLocal?, lastError?, updatedAt }

// Pause/resume by blobId (the queueId is the blobId for document uploads)
blobs.pauseUpload(blobId);
blobs.resumeUpload(blobId);

blobs.pauseAll();
blobs.resumeAll();

// Concurrency is set on the client (global, all documents)
client.setBlobUploadConcurrency(5); // min 1; default 2
client.getBlobUploadConcurrency();
```

---

## Events (JS-only)

```typescript
// status here is one of: "queued" | "uploading" | "pending" | "paused"
client.on("blobs:upload-progress", (e) => {
  console.log(e.queueId, e.blobId, e.status, e.numBytes, e.attempts);
});

client.on("blobs:upload-completed", (e) => {
  console.log("done", e.blobId, e.queueId);
});

client.on("blobs:upload-failed", (e) => {
  console.log("failed", e.blobId, e.lastError, "retry?", e.willRetry);
});

client.on("blobs:queue-drained", () => {
  console.log("all uploads finished");
});

// Also available: "blobs:upload-paused", "blobs:upload-resumed"
```

`upload-progress` is *not* a byte-level progress event — it fires on status transitions. There is no per-byte progress callback.

---

## Service worker proxy (for `<img>` / `<video>`) (JS/web-only)

`downloadUrl` requires the request to carry the user's auth token, which `<img>` tags don't do. Use `proxyUrl` if you've registered a service worker that forwards Primitive auth headers.

```typescript
if (blobs.hasServiceWorkerControl()) {
  imageElement.src = blobs.proxyUrl(blobId, {
    disposition: "inline",
    attachmentFilename: "image.png", // optional
  });
} else {
  // Fallback: read into memory and use a Blob URL.
  const blob = await blobs.read(blobId, { as: "blob" }) as Blob;
  imageElement.src = URL.createObjectURL(blob);
  // Remember to URL.revokeObjectURL(...) when done.
}
```

`proxyUrl` returns the same URL as `downloadUrl`; it just signals intent to be intercepted by the service worker. See the js-bao-wss-client README for a service-worker implementation.

---

## Permissions (document blobs)

| Operation                              | Required document permission     |
|----------------------------------------|----------------------------------|
| Upload, Delete                         | `read-write`, `admin`, or `owner` |
| List, Get metadata, Download, Read     | `reader` or higher                |

---

## Document thumbnails and presentation metadata

A document carries two fields that pair naturally with the blob system — set them with `client.documents.update(documentId, ...)` (covered in detail in the [Documents guide](AGENT_GUIDE_TO_PRIMITIVE_DOCUMENTS.md#updating-document-metadata)):

- **`thumbnailBlobId`** points at an existing blob owned by the document. Anyone with access to the document inherits read access to the referenced blob, so a thumbnail uploaded as a private document blob can safely back a thumbnail surface.
- **`metadata`** is a small JSON-serializable object capped at 4KB serialized UTF-8. Use it for presentation hints that should travel with the document (cover image references, color tags, list-card layout, etc.).

Both fields are optional and accept `null` to clear. Errors surface as `BLOB_NOT_FOUND` (referenced blob missing), `BLOB_DOC_MISMATCH` (blob belongs to a different document), or `METADATA_TOO_LARGE` (serialized `metadata` exceeds 4KB).

---

## Complete example: image upload with progress + display (JS/web-only)

```typescript
async function uploadAndDisplay(
  client: JsBaoClient,
  documentId: string,
  file: File,
  imgEl: HTMLImageElement
) {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Document blobs are capped at 10 MB. Use a bucket instead.");
  }
  const blobs = client.document(documentId).blobs();

  const onProgress = (e: any) => {
    if (e.blobId) console.log(`[${e.blobId}] ${e.status} (attempt ${e.attempts})`);
  };
  client.on("blobs:upload-progress", onProgress);

  try {
    const { blobId } = await blobs.upload(file); // filename + contentType inferred

    if (blobs.hasServiceWorkerControl()) {
      imgEl.src = blobs.proxyUrl(blobId, { disposition: "inline" });
    } else {
      const data = (await blobs.read(blobId, { as: "blob" })) as Blob;
      imgEl.src = URL.createObjectURL(data);
    }
    return blobId;
  } finally {
    client.off("blobs:upload-progress", onProgress);
  }
}
```

## Complete example: offline-ready gallery (JS/web-only)

```typescript
async function loadGallery(client: JsBaoClient, documentId: string) {
  const blobs = client.document(documentId).blobs();
  const { items } = await blobs.list({ limit: 200 });
  const images = items.filter((b: any) => b.contentType?.startsWith("image/"));

  await blobs.prefetch(images.map((b: any) => b.blobId), { concurrency: 4 });

  return images.map((b: any) => ({
    id: b.blobId,
    // Use proxyUrl if a service worker is registered, otherwise blob URLs.
    url: blobs.hasServiceWorkerControl()
      ? blobs.proxyUrl(b.blobId, { disposition: "inline" })
      : null,
    filename: b.filename,
  }));
}
```

---

# Part 2 — Blob Buckets

General-purpose binary storage that isn't tied to a document. Use buckets for avatars, public assets, workflow outputs, short-lived exports, and anywhere you need a signed URL.

## Bucket configuration

A bucket has a `ttlTier` and an `accessPolicy`. Configure via TOML sync (preferred), the CLI, or `createBucket` (see **Bucket admin** above).

```toml
# config/blob-buckets/avatars.toml
[bucket]
key = "avatars"
name = "User avatars"
description = "Profile pictures"           # optional
ttlTier = "permanent"                       # 1d | 3d | 14d | 28d | 180d | 365d | permanent
accessPolicy = "authenticated"              # public-read | authenticated | owner-only
# ruleSetId is accepted in TOML/CLI but currently NOT enforced for bucket reads/writes.
```

The TOML root table is `[bucket]` (not `[blobBucket]`). The CLI's `primitive sync` reads from `config/blob-buckets/<key>.toml`.

Or via CLI:

```bash
primitive blob-buckets create \
  --key avatars --name "User avatars" \
  --ttl permanent --access authenticated
```

### Access policies

| Policy           | Read                                  | Write                                 |
|------------------|---------------------------------------|---------------------------------------|
| `public-read`    | Anyone (no auth)                      | Admin/owner only                      |
| `authenticated`  | Any signed-in user (or admin/owner)   | Any signed-in user (or admin/owner)   |
| `owner-only`     | Admin/owner only                      | Admin/owner only                      |

A `ruleSetId` field is accepted at bucket creation but is currently **not enforced** by the bucket blob access checks — only the three `accessPolicy` values above gate reads and writes. If you need finer-grained control today, model it at the application layer (e.g. issue signed URLs only after your own check passes).

### TTL tiers

The storage layer automatically expires objects based on the bucket's `ttlTier`. Pick the shortest tier that fits.

| Tier        | Lifetime                          |
|-------------|-----------------------------------|
| `1d`        | ~1 day                            |
| `3d`        | ~3 days                           |
| `14d`       | ~14 days                          |
| `28d`       | ~28 days                          |
| `180d`      | ~180 days                         |
| `365d`      | ~365 days                         |
| `permanent` | No automatic expiry               |

Don't reach for `permanent` for short-lived content — pay only for what you need.

---

## Client API

The bucket API lives at `client.blobBuckets`. **All methods take `bucketIdOrKey` as a positional argument** — there is no per-bucket context object. The core operations (upload, signed URL, download, list, metadata, delete) are shown in **Bucket operations** above; bucket admin in **Bucket admin**.

Notes on the surface:

- **Upload** accepts `data: ArrayBuffer | Uint8Array | Blob | string` (JS) or `Data` (Swift). A `File` works in JS (it's a `Blob`). `tags: string[]` is the only extra metadata — there is no arbitrary `metadata` field. Result: `{ blobId, bucketId, filename, contentType, numBytes, sha256, tags, createdBy }`.
- **Signed URL** defaults to 300s, min 30s, max 86400s (clamped server-side). Result: `{ url, token, expiresAt (unix seconds), expiresInSeconds }`.
- **Download** returns an `ArrayBuffer` (JS) / `Data` (Swift) via an authenticated request.
- **List** is cursor-paginated; default limit 100, max 1000.

### Don't do this

```typescript
// DON'T: try to use a per-bucket context object — it doesn't exist.
const bucket = client.blobBuckets.bucket("avatars"); // TypeError
await bucket.upload(...);                            // TypeError

// DON'T: invent a `signedUrl` method — the actual name is getSignedUrl.
await client.blobBuckets.signedUrl("avatars", blobId, { expiresInSeconds: 3600 });
// Correct:
await client.blobBuckets.getSignedUrl("avatars", blobId, 3600);

// DON'T: attach `metadata: {...}` at upload time. The bucket upload API only
// accepts `tags: string[]`. There is no arbitrary metadata field, and even
// `tags` are stored as object metadata — they don't gate access on their own.
await client.blobBuckets.upload("k", { filename, data, metadata: {} }); // ignored

// DON'T: ask for a >24h signed URL — the server clamps to 86400s.
await client.blobBuckets.getSignedUrl("k", id, 7 * 86400); // becomes 86400

// DON'T: put auth-required URLs in <img src>. Use a signed URL or download() + Blob URL.
imgEl.src = `/app/${appId}/api/blob-buckets/${bucketId}/blobs/${blobId}`; // 401
```

### Signed URLs in `<img>` / `<video>`

The signed-URL call is shown in **Read (signed URL / download)** above. In the browser, point an element at the returned `url`:

```typescript
const { url, expiresAt } = await client.blobBuckets.getSignedUrl(
  "avatars",
  blobId,
  3600
);
imgEl.src = url;

// Cache the URL (and re-fetch a new one slightly before expiresAt). Don't call
// getSignedUrl on every render — each call is a server round-trip.
```

A signed URL bypasses the bucket's access policy entirely (anyone with the URL can read until it expires). Treat them as bearer tokens. Don't email or log them.

The signed-URL request endpoint requires `member` permission on the app, so generation itself is restricted to authenticated app users — even for a `public-read` bucket. The resulting URL is then unauthenticated.

---

## Workflow integration

The `blob.upload`, `blob.download`, and `blob.signedUrl` workflow steps write to and read from buckets. Steps reference the bucket by `bucketId` or `bucketKey`. See the [Workflows guide](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md).

---

## Anti-patterns

- Storing user-uploaded documents in a bucket when they should be document-scoped blobs with permission inheritance.
- Leaving a bucket on `permanent` when blobs are only needed briefly. Object storage is billed; pick the shortest tier.
- Using `public-read` and then trying to enforce per-user access. `public-read` bypasses all per-user checks at read time. Use `authenticated` and gate access in your own code before issuing signed URLs.
- Calling `getSignedUrl` on every render. Each call is a network round-trip; cache the URL until `expiresAt - 60s`.
- Writing to the underlying object store outside of Primitive. Side-channel objects don't appear in `list()` and won't be cleaned up by bucket deletion.
- Reusing a `documentId` as a `bucketKey`. Different namespaces; offers no benefit and is confusing.
