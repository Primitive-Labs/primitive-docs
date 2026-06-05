import JsBaoClient

// Delete a document. It must be closed first, or pass `forceCloseIfOpen: true`.
// Root documents cannot be deleted.
func deleteDocument(client: JsBaoClient, documentId: String) async throws {
  // #region example
  // Must be closed first
  try await client.documents.delete(documentId: documentId)

  // Force-close before deleting
  try await client.documents.delete(
    documentId: documentId,
    options: DeleteDocumentOptions(forceCloseIfOpen: true)
  )
  // #endregion example
}
