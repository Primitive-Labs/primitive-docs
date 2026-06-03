import JsBaoClient

// Build an authenticated, inline-disposition download URL for an image blob so
// it can be rendered directly in an image view.
func displayDocumentImage(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) {
  let blobs = client.documents.blobs(documentId: documentId)
  // #region example
  let imageUrl = blobs.downloadUrl(blobId: blobId, disposition: .inline)
  // #endregion example
  _ = imageUrl
}
