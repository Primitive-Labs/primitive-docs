import type { JsBaoClient } from "js-bao-wss-client";

// List, inspect, and delete a document's blobs.
export async function manageDocumentBlobs(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();

  const { items, cursor } = await blobs.list({ limit: 50 });
  const meta = await blobs.get(blobId);
  await blobs.delete(blobId);
  // #endregion example
  return { items, cursor, meta };
}

// Warm the local cache by prefetching blobs before they're needed.
export async function prefetchDocumentBlobs(
  client: JsBaoClient,
  documentId: string,
  blobId1: string,
  blobId2: string,
) {
  // #region prefetch
  const blobs = client.document(documentId).blobs();
  await blobs.prefetch([blobId1, blobId2], { concurrency: 4 });
  // #endregion prefetch
}
