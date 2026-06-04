import JsBaoClient

// Delete a document. It must be closed first, or pass `forceCloseIfOpen: true`.
// Root documents cannot be deleted.
func deleteDocument(client: JsBaoClient, documentId: String) async throws {
  // #region example
  // Must be closed first
  _ = try await client.documents.delete(documentId: documentId)

  // Force-close before deleting
  _ = try await client.documents.delete(documentId: documentId, forceCloseIfOpen: true)
  // #endregion example
}
