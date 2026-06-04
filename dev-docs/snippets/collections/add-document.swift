import JsBaoClient

// Add a document to a collection. Returns a `CollectionDocumentInfo`.
func addDocument(
  client: JsBaoClient,
  collectionId: String,
  documentId: String
) async throws {
  // #region example
  let entry = try await client.collections.addDocument(
    collectionId: collectionId,
    documentId: documentId
  )
  // #endregion example
  _ = entry
}
