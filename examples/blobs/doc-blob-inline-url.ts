import type { JsBaoClient } from "js-bao-wss-client";

// Build an authenticated URL that renders a document blob inline — e.g. as an
// <img> src. Works for any signed-in user with access to the document.
export function buildImageUrl(
  client: JsBaoClient,
  documentId: string,
  blobId: string,
) {
  const blobs = client.document(documentId).blobs();
  // #region example
  const imageUrl = blobs.downloadUrl(blobId, { disposition: "inline" });
  // #endregion example
  return imageUrl;
}
