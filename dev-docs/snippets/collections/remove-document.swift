import JsBaoClient

// Remove a document from a collection. Returns `SuccessResult { success }`.
func removeDocument(
  client: JsBaoClient,
  collectionId: String,
  documentId: String
) async throws {
  // #region example
  let result = try await client.collections.removeDocument(
    collectionId: collectionId,
    documentId: documentId
  )
  let success = result.success
  // #endregion example
  _ = success
}
