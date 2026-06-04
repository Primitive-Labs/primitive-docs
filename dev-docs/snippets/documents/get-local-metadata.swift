import JsBaoClient

// Get locally cached metadata for a document (nil if none stored). Declared
// async to match the JS accessor; the Swift read itself is a local lookup.
func getLocalMetadata(client: JsBaoClient, documentId: String) async {
  // #region example
  let metadata = await client.documents.getLocalMetadata(documentId: documentId)
  // #endregion example
  _ = metadata
}
