# Agent Guide to Primitive Blob Storage

Guidelines for AI agents implementing file storage in Primitive apps.

## Overview

Blobs are binary files (images, PDFs, etc.) stored per document. They inherit document permissions and support offline caching.

**Access pattern:**

```typescript
const blobs = client.document(documentId).blobs();
```

---

## Uploading Blobs

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

const arrayBuffer = await file.arrayBuffer();
const { blobId } = await client.document(documentId).blobs().upload(
  new Uint8Array(arrayBuffer),
  {
    filename: file.name,
    contentType: file.type,
  }
);
```

### Convenience Helper

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
  console.log(blob.blobId, blob.filename, blob.size);
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
console.log(meta.filename, meta.contentType, meta.size);
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
  // status: "pending" | "uploading" | "completed" | "failed"
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
client.documents.setUploadConcurrency(5);
console.log("Current:", client.documents.getUploadConcurrency());
```

---

## Blob Events

Listen for upload progress and completion:

```typescript
// Upload progress
client.on("blobs:upload-progress", ([event]) => {
  console.log(event.queueId, event.status, event.bytesTransferred);
});

// Upload completed
client.on("blobs:upload-completed", ([event]) => {
  console.log("Upload done:", event.queueId);
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
const blobs = client.documents.blobs(documentId);

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
  const progressHandler = ([event]) => {
    if (event.filename === file.name) {
      const percent = Math.round((event.bytesTransferred / file.size) * 100);
      console.log(`Upload progress: ${percent}%`);
    }
  };
  client.on("blobs:upload-progress", progressHandler);

  try {
    // Read file
    const arrayBuffer = await file.arrayBuffer();

    // Upload
    const { blobId } = await blobs.upload(new Uint8Array(arrayBuffer), {
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
