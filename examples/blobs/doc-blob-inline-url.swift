import JsBaoClient

// Build an authenticated URL that renders a document blob inline — e.g. for
// an image view. Works for any signed-in user with access to the document.
func buildImageUrl(
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
