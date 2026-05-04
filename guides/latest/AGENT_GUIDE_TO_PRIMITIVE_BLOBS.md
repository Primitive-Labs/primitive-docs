# Agent Guide to Primitive Blob Storage

Guidelines for AI agents implementing file storage in Primitive apps.

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

`upload` accepts `File | Blob | Uint8Array | ArrayBuffer`. SHA-256 is computed client-side and used for server-side dedup.

```typescript
import type {
  BlobUploadSourceOptions,
  BlobUploadResult,
} from "js-bao-wss-client";

const data = new TextEncoder().encode("hello blob");
const { blobId, numBytes, contentType } = await blobs.upload(data, {
  filename: "hello.txt",
  contentType: "text/plain",
  disposition: "attachment", // or "inline"; stored on the blob (sent as
                              // X-Blob-Disposition). Note: the download
                              // endpoint chooses Content-Disposition from the
                              // ?disposition= query param (default "attachment"),
                              // not from the upload-time value — pass
                              // disposition explicitly to downloadUrl/proxyUrl
                              // when serving inline.
  // retainLocal: true (default) — keep a local copy after upload completes
  // retainLocal: false — delete local bytes once the server confirms upload
});
```

### From a file input (browser)

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

### `uploadFile` vs `upload`

Both call the same code path. `uploadFile` returns a slightly trimmed result (`{ blobId, numBytes, bytesTransferred? }`). Prefer `upload`.

---

## Listing

```typescript
const page1 = await blobs.list({ limit: 50 });
for (const b of page1.items) {
  console.log(b.blobId, b.filename, b.contentType, b.numBytes, b.sha256, b.createdAt);
}
if (page1.cursor) {
  const page2 = await blobs.list({ cursor: page1.cursor });
}
```

`cursor` is an opaque pagination token; only present when more results exist.

---

## Get metadata

```typescript
const meta = await blobs.get(blobId);
// { blobId, filename, contentType, numBytes, sha256, createdAt, ... }
```

---

## Downloading

### Download URL (authenticated)

```typescript
const url = blobs.downloadUrl(blobId, {
  disposition: "attachment",        // or "inline"
  attachmentFilename: "report.pdf", // optional override (RFC 5987-encoded)
});
// Synchronous; returns a string. Authenticated via the user's session/cookie
// against the API origin. Works in <a href={url} download> or window.location.
```

### Read content into memory

```typescript
const text  = await blobs.read(blobId, { as: "text" });
const buf   = await blobs.read(blobId, { as: "arrayBuffer" });
const blob  = await blobs.read(blobId, { as: "blob" });
const bytes = await blobs.read(blobId, { as: "uint8array" }); // default

// Bypass the local Cache API + IndexedDB cache and re-fetch from the server.
const fresh = await blobs.read(blobId, { as: "text", forceRedownload: true });
```

`read` checks the cache first; on a miss it fetches from the server and writes the response into the cache. When offline (`networkMode === "offline"`) and the cache is empty, it throws `"Blob cache unavailable while offline"`.

---

## Deleting

```typescript
const { deleted } = await blobs.delete(blobId); // { deleted: true }
```

Also cancels any in-flight upload for the same `blobId` and clears local bytes.

---

## Offline & the upload queue

The upload queue is keyed by user identity. It hydrates from IndexedDB on sign-in, retries with exponential backoff (2s base, 60s max), and persists across page reloads.

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

## Queue management

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

## Events

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

## Service worker proxy (for `<img>` / `<video>`)

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

## Complete example: image upload with progress + display

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

## Complete example: offline-ready gallery

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

A bucket has a `ttlTier` and an `accessPolicy`. Configure via TOML sync (preferred) or the CLI.

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

R2 lifecycle automatically expires objects based on the bucket's `ttlTier`. Pick the shortest tier that fits.

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

The bucket API lives at `client.blobBuckets`. **All methods take `bucketIdOrKey` as a positional argument** — there is no per-bucket context object.

```typescript
import type {
  BlobInfo,
  BlobUploadParams,
  BucketBlobUploadResult,
  BlobSignedUrlResult,
} from "js-bao-wss-client";

// Upload (data: ArrayBuffer | Uint8Array | Blob | string)
const result: BucketBlobUploadResult = await client.blobBuckets.upload(
  "avatars",
  {
    filename: "alice.jpg",
    contentType: "image/jpeg",
    data: file, // a File works (it's a Blob); also ArrayBuffer, Uint8Array, or string
    tags: ["profile", "user:alice"], // optional
  }
);
// result: { blobId, bucketId, filename, contentType, numBytes, sha256, tags, createdBy }

// Signed URL (default 300s, min 30s, max 86400s; clamped server-side)
const signed: BlobSignedUrlResult = await client.blobBuckets.getSignedUrl(
  "avatars",
  result.blobId,
  3600 // expiresInSeconds
);
// signed: { url, token, expiresAt (unix seconds), expiresInSeconds }
imgEl.src = signed.url;

// Direct download (returns ArrayBuffer; uses authenticated request)
const buf: ArrayBuffer = await client.blobBuckets.download("avatars", blobId);

// List blobs in a bucket (R2 cursor pagination; default limit 100, max 1000)
const { items, cursor } = await client.blobBuckets.list("avatars", { limit: 50 });

// Metadata only
const meta: BlobInfo = await client.blobBuckets.getMetadata("avatars", blobId);

// Delete a blob
await client.blobBuckets.delete("avatars", blobId);

// Bucket admin (admin/owner only)
await client.blobBuckets.createBucket({
  bucketKey: "uploads",
  name: "User uploads",
  ttlTier: "28d",
  accessPolicy: "authenticated",
});
const buckets = await client.blobBuckets.listBuckets();
const bucket  = await client.blobBuckets.getBucket("avatars");
await client.blobBuckets.deleteBucket("avatars"); // cascades to all blobs
```

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
// `tags` are stored in R2 customMetadata — they don't gate access on their own.
await client.blobBuckets.upload("k", { filename, data, metadata: {} }); // ignored

// DON'T: ask for a >24h signed URL — the server clamps to 86400s.
await client.blobBuckets.getSignedUrl("k", id, 7 * 86400); // becomes 86400

// DON'T: put auth-required URLs in <img src>. Use a signed URL or download() + Blob URL.
imgEl.src = `/app/${appId}/api/blob-buckets/${bucketId}/blobs/${blobId}`; // 401
```

### Signed URLs in `<img>` / `<video>`

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
- Leaving a bucket on `permanent` when blobs are only needed briefly. R2 storage is billed; pick the shortest tier.
- Using `public-read` and then trying to enforce per-user access. `public-read` bypasses all per-user checks at read time. Use `authenticated` and gate access in your own code before issuing signed URLs.
- Calling `getSignedUrl` on every render. Each call is a network round-trip; cache the URL until `expiresAt - 60s`.
- Writing to R2 outside of Primitive. Side-channel objects don't appear in `list()` and won't be cleaned up by bucket deletion.
- Reusing a `documentId` as a `bucketKey`. Different namespaces; offers no benefit and is confusing.
