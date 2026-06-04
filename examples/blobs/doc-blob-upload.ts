import type { JsBaoClient } from "js-bao-wss-client";

// Document-scoped blob: upload a file attached to a document (access follows
// the document's permissions; 10MB cap).
export async function uploadDocumentBlob(
  client: JsBaoClient,
  documentId: string,
  data: Uint8Array,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  const { blobId } = await blobs.upload(data, {
    filename: "notes.txt",
    contentType: "text/plain",
  });
  // #endregion example
  return blobId;
}
