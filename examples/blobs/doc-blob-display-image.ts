import type { JsBaoClient } from "js-bao-wss-client";

// Build an authenticated, inline-disposition download URL for an image blob so
// it can be rendered directly in an <img> tag.
export function displayDocumentImage(
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
