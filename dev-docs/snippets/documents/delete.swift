import JsBaoClient

// Delete a document. Swift returns an untyped `[String: Any]` (vs JS `void`)
// and does not perform local eviction.
func deleteDocument(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.delete(
    documentId: documentId, forceCloseIfOpen: true
  )
  // #endregion example
  _ = result
}
