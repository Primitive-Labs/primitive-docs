# Blobs and Files

Primitive provides document-scoped file storage for images, PDFs, attachments, and any binary data. Files are uploaded to the server, with automatic offline caching and upload queuing.

::: info Document-Scoped (for now)
Blobs are currently scoped to a document — access control follows the document's permissions. A more generic blob service that works outside of a document context is coming soon.
:::

## Uploading Files

```typescript
import { jsBaoClientService } from "primitive-app";

const client = await jsBaoClientService.getClientAsync();
const blobs = client.document(documentId).blobs();

// Upload from a file input
const file = inputElement.files[0];
const fileData = await file.arrayBuffer();

const { blobId, numBytes } = await blobs.upload(
  new Uint8Array(fileData),
  {
    filename: file.name,
    contentType: file.type,
  }
);
```

## Displaying Images

```typescript
// Get a URL for inline display
const imageUrl = blobs.downloadUrl(blobId, { disposition: "inline" });
```

```vue
<template>
  <img :src="imageUrl" alt="User uploaded image" />
</template>
```

The URL includes authentication, so it only works for signed-in users with document access.

## Downloading Files

```typescript
// Trigger browser download
const url = blobs.downloadUrl(blobId, { disposition: "attachment" });
window.open(url);

// Or read content directly
const text = await blobs.read(blobId, { as: "text" });
const buffer = await blobs.read(blobId, { as: "arrayBuffer" });
const blob = await blobs.read(blobId, { as: "blob" });
```

## Listing and Managing Blobs

```typescript
// List blobs in a document
const { items, cursor } = await blobs.list({ limit: 50 });

items.forEach(blob => {
  console.log(blob.blobId, blob.filename, blob.size);
});

// Get metadata
const meta = await blobs.get(blobId);

// Delete
await blobs.delete(blobId);
```

## Offline Support

Blob storage works offline:

- **Uploads queue** when offline and complete automatically when back online
- **Downloaded files cache** locally for offline access
- **Prefetch files** proactively for offline use:

```typescript
await blobs.prefetch([blobId1, blobId2], { concurrency: 4 });
```

## Dev Tools

Use the **Blob Explorer** in the dev tools overlay to browse, upload, and manage blobs during development. See [Dev Tools](./devtools.md) for details.

## Next Steps

- **[Working with Documents](./working-with-documents.md)** — Documents that blobs are scoped to
- **[Dev Tools](./devtools.md)** — Blob Explorer and other development tools
