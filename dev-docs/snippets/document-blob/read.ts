import type { JsBaoClient } from "js-bao-wss-client";

export async function read(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  // `as` picks the return format: "uint8array" | "arrayBuffer" | "blob" | "text".
  const bytes = await blobs.read(blobId, { as: "arrayBuffer" });
  const text = await blobs.read(blobId, { as: "text", forceRedownload: true });
  // #endregion example
  return { bytes, text };
}
