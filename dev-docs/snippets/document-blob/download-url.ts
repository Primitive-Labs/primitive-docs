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
    attachmentFilename: "report.pdf", // overrides the download filename
  });
  // #endregion example
  return url;
}
