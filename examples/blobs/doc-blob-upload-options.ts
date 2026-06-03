import type { JsBaoClient } from "js-bao-wss-client";

// Document-scoped upload with an explicit content disposition. `disposition`
// is stored on the blob (sent as X-Blob-Disposition); the download endpoint
// still picks Content-Disposition from its own ?disposition= query param.
export async function uploadDocumentBlobWithOptions(
  client: JsBaoClient,
  documentId: string,
) {
  const blobs = client.document(documentId).blobs();
  // #region example
  const data = new TextEncoder().encode("hello blob");
  const { blobId, numBytes, contentType } = await blobs.upload(data, {
    filename: "hello.txt",
    contentType: "text/plain",
    disposition: "attachment", // or "inline"
    // retainLocal defaults to true; set false to drop local bytes once the
    // server confirms the upload (JS-only option).
  });
  // #endregion example
  return { blobId, numBytes, contentType };
}
