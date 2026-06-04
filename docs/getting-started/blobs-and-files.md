# Blobs and Files

Primitive provides document-scoped file storage for images, PDFs, attachments, and any binary data. Files are uploaded to the server, with automatic offline caching and upload queuing.

::: info Two kinds of blob storage
This page covers **document-scoped blobs** — files attached to a specific document, with access following the document's permissions. For general-purpose storage that isn't tied to a document (avatars, public assets, workflow outputs, time-boxed downloads), see [Blob Buckets](./blob-buckets.md).
:::

## Uploading Files

::: code-group

<<< ../../examples/blobs/doc-blob-upload.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/doc-blob-upload.swift#example{swift} [Swift]

:::

The blob context comes from the document, as shown above — uploads, downloads, and listing all hang off it.

## Displaying Images

::: code-group

```typescript [JavaScript]
const imageUrl = blobs.downloadUrl(blobId, { disposition: "inline" });
```

```swift [Swift]
let imageUrl = blobs.downloadUrl(blobId: blobId, disposition: .inline)
```

:::

```vue
<template>
  <img :src="imageUrl" alt="User uploaded image" />
</template>
```

The URL includes authentication, so it only works for signed-in users with document access.

## Downloading Files

::: code-group

<<< ../../examples/blobs/doc-blob-read.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/doc-blob-read.swift#example{swift} [Swift]

:::

`downloadUrl` is synchronous and authenticated.

## Listing and Managing Blobs

::: code-group

<<< ../../examples/blobs/doc-blob-manage.ts#example{ts} [JavaScript]

<<< ../../examples/blobs/doc-blob-manage.swift#example{swift} [Swift]

:::

## Caching and Upload Queuing

Blob storage tolerates flaky connections:

- **Uploads queue** when the network drops and complete automatically when it returns
- **Downloaded files cache** locally, so repeat reads are instant
- **Prefetch files** proactively to warm the cache:

```typescript
await blobs.prefetch([blobId1, blobId2], { concurrency: 4 });
```

## Dev Tools

Use the **Blob Explorer** in the dev tools overlay to browse, upload, and manage blobs during development. See [Dev Tools](./devtools.md) for details.

## Next Steps

- **[Working with Documents](./working-with-documents.md)** — Documents that blobs are scoped to
- **[Blob Buckets](./blob-buckets.md)** — General-purpose blob storage for non-document files
- **[Dev Tools](./devtools.md)** — Blob Explorer and other development tools
