import type { JsBaoClient } from "js-bao-wss-client";

// List a document's blobs, get an authenticated URL, and read bytes.
export async function readDocumentBlobs(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();

  const list = await blobs.list();
  const url = blobs.downloadUrl(blobId);              // synchronous, authenticated
  const bytes = await blobs.read(blobId, { as: "arrayBuffer" });
  // #endregion example
  return { list, url, bytes };
}
