import type { JsBaoClient } from "js-bao-wss-client";

// Build an authenticated download URL for a document blob. The URL is
// authenticated via the user's session against the API origin and works in an
// <a href download> or window.location. The endpoint chooses Content-Disposition
// from this `disposition`, not the upload-time value.
export function buildDownloadUrl(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  const blobs = client.document(documentId).blobs();
  // #region example
  const url = blobs.downloadUrl(blobId, {
    disposition: "attachment",        // or "inline"
    attachmentFilename: "report.pdf", // optional override (RFC 5987-encoded)
  });
  // #endregion example
  return url;
}
