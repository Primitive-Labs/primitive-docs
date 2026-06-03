import type { JsBaoClient } from "js-bao-wss-client";

export function resumeUpload(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  const resumed = blobs.resumeUpload(blobId); // true if a paused upload was resumed
  // #endregion example
  return resumed;
}
