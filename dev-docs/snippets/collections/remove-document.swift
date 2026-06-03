import JsBaoClient

// Remove a document from a collection. Swift returns an untyped `[String: Any]`
// rather than JS's `{ success: boolean }`.
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
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
