import type { JsBaoClient } from "js-bao-wss-client";

export async function uploadFile(
  client: JsBaoClient,
  documentId: string,
  data: Uint8Array,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  // Like upload(), but queues for background transfer if the upload queue is active.
  const { blobId, numBytes } = await blobs.uploadFile(data, {
    filename: "large.bin",
    contentType: "application/octet-stream",
  });
  // #endregion example
  return { blobId, numBytes };
}
