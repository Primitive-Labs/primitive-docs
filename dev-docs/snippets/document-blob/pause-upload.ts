import type { JsBaoClient } from "js-bao-wss-client";

export function pauseUpload(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  const paused = blobs.pauseUpload(blobId); // true if an in-progress upload was paused
  // #endregion example
  return paused;
}
