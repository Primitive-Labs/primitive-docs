import type { JsBaoClient } from "js-bao-wss-client";

export async function upload(
  client: JsBaoClient,
  documentId: string,
  data: Uint8Array,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  const { blobId, numBytes, contentType } = await blobs.upload(data, {
    filename: "notes.txt",
    contentType: "text/plain",
    disposition: "attachment", // or "inline"
    retainLocal: true, // keep local bytes after upload (JS-only option)
  });
  // #endregion example
  return { blobId, numBytes, contentType };
}
