import type { JsBaoClient } from "js-bao-wss-client";

export async function deleteX(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  const { deleted } = await blobs.delete(blobId);
  // #endregion example
  return deleted;
}
