import type { JsBaoClient } from "js-bao-wss-client";

export function downloadUrl(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  // #region example
  const blobs = client.document(documentId).blobs();
  const url = blobs.downloadUrl(blobId, {
    disposition: "attachment",
    attachmentFilename: "report.pdf", // JS-only
  });
  // #endregion example
  return url;
}
