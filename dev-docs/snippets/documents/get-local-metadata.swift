import JsBaoClient

// Get locally cached metadata for a document (nil if none stored). Swift is a
// synchronous local read (vs JS's async accessor).
func getLocalMetadata(client: JsBaoClient, documentId: String) {
  // #region example
  let metadata = client.documents.getLocalMetadata(documentId: documentId)
  // #endregion example
  _ = metadata
}
