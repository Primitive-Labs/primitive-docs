import type { JsBaoClient } from "js-bao-wss-client";

export async function get(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  const meta = await blobs.get(blobId);
  // #endregion example
  return meta;
}
