import type { JsBaoClient } from "js-bao-wss-client";

export async function prefetch(
  client: JsBaoClient,
  documentId: string,
  blobIds: string[],
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  // Pre-download blobs into the local cache for offline access.
  await blobs.prefetch(blobIds, { concurrency: 4 });
  // #endregion example
}
