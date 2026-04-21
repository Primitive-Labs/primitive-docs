# Agent Guide to Primitive Blob Storage

Guidelines for AI agents implementing file storage in Primitive apps.

## Overview

Primitive offers two kinds of blob storage.

**Document-scoped blobs** — binary files attached to a specific document. Access follows the document's permissions; includes offline caching and upload queuing. Covered in the first half of this guide.

```typescript
const blobs = client.document(documentId).blobs();
```

**Blob buckets** — general-purpose storage outside a document context. Each bucket has its own access policy, TTL tier, and signed-URL behavior. Covered in the "Blob Buckets" section below.

```typescript
const bucket = client.blobBuckets.bucket("avatars");
```

**Decision rule:** use document-scoped blobs when the file's lifetime and access naturally match a document's. Use a bucket for avatars, workflow outputs, public assets, anonymous uploads, or anything that should live outside any specific document.

---

## Uploading Blobs

The `upload` method accepts `File | Blob | Uint8Array | ArrayBuffer` as the source.

### Basic Upload

```typescript
const data = new TextEncoder().encode("hello blob");
const { blobId, numBytes, contentType } = await blobs.upload(data, {
  filename: "hello.txt",
  contentType: "text/plain",
  disposition: "attachment", // or "inline"
});
```

### Upload from File Input (Browser)

```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// File objects can be passed directly — no need to convert to ArrayBuffer
const { blobId } = await client.document(documentId).blobs().upload(file, {
  filename: file.name,
  contentType: file.type,
});
```

### Convenience Helper

`uploadFile` queues the upload for background transfer when the upload queue is active.

```typescript
const { blobId, numBytes } = await client
  .document(documentId)
  .blobs()
  .uploadFile(new TextEncoder().encode("content"), {
    filename: "file.txt",
    contentType: "text/plain",
  });
```

---

## Listing Blobs

```typescript
// List with pagination
const page1 = await client.document(documentId).blobs().list({ limit: 10 });

page1.items.forEach((blob) => {
  console.log(blob.blobId, blob.filename, blob.numBytes, blob.sha256);
});

// Get next page
if (page1.cursor) {
  const page2 = await blobs.list({ cursor: page1.cursor });
}
```

---

## Getting Blob Metadata

```typescript
const meta = await client.document(documentId).blobs().get(blobId);
console.log(meta.filename, meta.contentType, meta.numBytes);
```

---

## Downloading Blobs

### Get Download URL

```typescript
const url = client
  .document(documentId)
  .blobs()
  .downloadUrl(blobId, { disposition: "attachment" });

// Use in browser
window.location.href = url;

// Or in an anchor tag
// <a href={url} download>Download</a>
```

### Read Blob Content

```typescript
// Read as different types
const text = await blobs.read(blobId, { as: "text" });
const arrayBuffer = await blobs.read(blobId, { as: "arrayBuffer" });
const blobObj = await blobs.read(blobId, { as: "blob" });
const bytes = await blobs.read(blobId, { as: "uint8array" });

// Force fresh download (bypass cache)
const fresh = await blobs.read(blobId, { as: "text", forceRedownload: true });
```

---

## Deleting Blobs

```typescript
await client.document(documentId).blobs().delete(blobId);
// Returns { deleted: true }
```

---

## Offline Blob Storage

Blob storage is fully offline-aware with automatic caching.

### Upload While Offline

```typescript
await client.setNetworkMode("offline");

const { blobId } = await client
  .document(documentId)
  .blobs()
  .upload(data, { filename: "draft.txt", contentType: "text/plain" });

// Bytes cached locally, queued for upload when online
```

### Read Cached Blobs Offline

```typescript
// Works offline if blob was previously downloaded or uploaded
const text = await client.document(documentId).blobs().read(blobId, { as: "text" });
```

### Prefetch for Offline Use

```typescript
// Download blobs into cache for offline access
await client.document(documentId).blobs().prefetch([blobId1, blobId2], {
  concurrency: 4,
  forceRedownload: false,
});
```

### Coming Back Online

```typescript
await client.setNetworkMode("online");
// Queued uploads process automatically
```

---

## Upload Queue Management

### Inspect Upload Queue

```typescript
const uploads = client.document(documentId).blobs().uploads();

uploads.forEach((task) => {
  console.log(task.blobId, task.status);
  // status: "pending" | "uploading" | "uploaded" | "paused"
});
```

### Pause/Resume Uploads

```typescript
const blobs = client.document(documentId).blobs();

// Pause/resume individual uploads
blobs.pauseUpload(blobId);
blobs.resumeUpload(blobId);

// Pause/resume all uploads for this document
blobs.pauseAll();
blobs.resumeAll();
```

### Set Upload Concurrency

```typescript
// Adjust how many uploads run in parallel (minimum 1)
client.setBlobUploadConcurrency(5);
console.log("Current:", client.getBlobUploadConcurrency());
```

---

## Blob Events

Listen for upload progress, completion, and failure:

```typescript
// Upload progress (status: "queued" | "uploading" | "pending" | "paused")
client.on("blobs:upload-progress", (event) => {
  console.log(event.queueId, event.status, event.numBytes, event.attempts);
});

// Upload completed
client.on("blobs:upload-completed", (event) => {
  console.log("Upload done:", event.queueId, event.blobId);
});

// Upload failed
client.on("blobs:upload-failed", (event) => {
  console.log("Upload failed:", event.queueId, event.lastError, event.willRetry);
});

// All uploads complete
client.on("blobs:queue-drained", () => {
  console.log("All uploads finished");
});
```

---

## Service Worker Integration

For using blobs in `<img>` and `<video>` tags without authentication issues:

```typescript
const blobs = client.document(documentId).blobs();

// Check if service worker is ready
if (blobs.hasServiceWorkerControl()) {
  const url = blobs.proxyUrl(blobId, {
    disposition: "inline",
    attachmentFilename: "image.png",
  });
  imageElement.src = url;
}
```

The client posts bridge messages to the service worker with auth tokens. See the js-bao-wss-client README for a complete service worker implementation example.

---

## Permissions

| Operation | Required Permission |
|-----------|---------------------|
| Upload | `read-write`, `admin`, or `owner` |
| List, Get metadata, Download | `reader` or higher |
| Delete | `read-write`, `admin`, or `owner` |

---

## Best Practices

1. **Always specify contentType** - Helps with proper file handling
2. **Use prefetch for critical assets** - Ensure offline availability
3. **Listen to queue events** - Show upload progress to users
4. **Handle large files carefully** - Consider chunked uploads for very large files
5. **Clean up unused blobs** - Delete blobs when their associated data is removed

---

## Complete Example: Image Upload with Progress

```typescript
async function uploadImage(documentId: string, file: File) {
  const blobs = client.document(documentId).blobs();

  // Set up progress listener
  const progressHandler = (event) => {
    if (event.filename === file.name) {
      console.log(`Upload status: ${event.status}, attempts: ${event.attempts}`);
    }
  };
  client.on("blobs:upload-progress", progressHandler);

  try {
    // File objects can be passed directly
    const { blobId } = await blobs.upload(file, {
      filename: file.name,
      contentType: file.type,
    });

    console.log("Uploaded:", blobId);
    return blobId;
  } finally {
    client.off("blobs:upload-progress", progressHandler);
  }
}
```

---

## Complete Example: Offline-Ready Gallery

```typescript
async function loadGallery(documentId: string) {
  const blobs = client.document(documentId).blobs();

  // List all images
  const { items } = await blobs.list();
  const imageBlobs = items.filter((b) => b.contentType?.startsWith("image/"));

  // Prefetch all for offline use
  await blobs.prefetch(
    imageBlobs.map((b) => b.blobId),
    { concurrency: 4 }
  );

  // Now images work offline
  return imageBlobs.map((b) => ({
    id: b.blobId,
    url: blobs.downloadUrl(b.blobId, { disposition: "inline" }),
    filename: b.filename,
  }));
}
```

---

## Blob Buckets

Blob buckets are general-purpose binary storage that isn't tied to a document. Use them for avatars, public assets, workflow outputs, short-lived exports, and anonymous uploads.

### Bucket Configuration

A bucket has an **access policy** and a **TTL tier**. Configure via TOML sync or the CLI.

```toml
# config/blob-buckets/avatars.toml
[blobBucket]
key = "avatars"
displayName = "User avatars"
accessPolicy = "authenticated"   # public | authenticated | owner | cel
ttlTier = "persistent"           # 1-hour | 1-day | 30-days | persistent
```

CEL-based access with per-action rules:

```toml
[blobBucket]
key = "team-exports"
accessPolicy = "cel"
ttlTier = "30-days"

[blobBucket.rules]
read = "isMemberOf('team', blob.metadata.teamId)"
write = "hasRole('admin') || isMemberOf('team', blob.metadata.teamId)"
delete = "hasRole('admin')"
```

CEL variables available:

| Variable | Notes |
|----------|-------|
| `user.userId`, `user.role` | Authenticated user (empty string when anonymous) |
| `blob.uploaderId` | The user who uploaded this blob |
| `blob.metadata.*` | Arbitrary metadata attached at upload time |
| `isMemberOf(type, id)`, `hasRole(role)` | Standard CEL helpers |

### Client API

```typescript
const bucket = client.blobBuckets.bucket("avatars");

// Upload
const { blobId } = await bucket.upload(fileBytes, {
  filename: "alice.jpg",
  contentType: "image/jpeg",
  metadata: { teamId: "eng" },
});

// Signed URL (for <img>, <video>, etc.)
const url = await bucket.signedUrl(blobId, { expiresInSeconds: 3600 });

// Direct read
const bytes = await bucket.read(blobId, { as: "arrayBuffer" });

// List
const { items, cursor } = await bucket.list({ limit: 50 });

// Metadata
const meta = await bucket.get(blobId);

// Delete
await bucket.delete(blobId);
```

### Critical Rules

1. **Pick the shortest TTL that fits.** `1-hour` for downloads, `1-day` for daily reports, `30-days` for time-boxed content, `persistent` only for truly permanent assets.

2. **Attach metadata at upload time for CEL rules.** If your rule references `blob.metadata.teamId`, the uploader must set it — the server does not infer it.

3. **Prefer signed URLs for display.** Short expiries (minutes to hours) and regenerate on demand. Do not put `authenticated` bucket URLs in emails or external pages — use signed URLs.

4. **Never write directly to R2.** Primitive tracks R2 objects it created. Side-channel writes don't appear in `list()`.

5. **Don't share bucket keys with document IDs.** Buckets have their own key namespace; reusing a document ID as a bucket key is confusing and offers no benefit.

### Workflow Integration

The `blob` workflow step writes to buckets. See the [Workflows guide](AGENT_GUIDE_TO_PRIMITIVE_WORKFLOWS.md).

### Choosing Access Policies

| Need | Policy |
|------|--------|
| Anyone can read (brand assets, marketing) | `public` |
| Any signed-in user can read and write (avatars) | `authenticated` |
| Only the uploader (+ admins) can access | `owner` |
| Role- or group-scoped | `cel` |

Pick the simplest policy that fits. Reach for `cel` only when the others can't express the requirement.

### Anti-Patterns

- ❌ Storing user-uploaded documents in a bucket when they should be document-scoped blobs with permission inheritance.
- ❌ Leaving a bucket on `persistent` when the blobs are only needed for a few hours — pay for storage you don't need.
- ❌ Putting user-specific logic in a `public` bucket's rules. Public buckets can't enforce per-user access — use `authenticated` or `cel`.
- ❌ Regenerating signed URLs on every render. Cache them for their expiry window.
