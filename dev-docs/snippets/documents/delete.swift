import JsBaoClient

// Delete a document from the server. Returns `Void`; pass
// `forceCloseIfOpen: true` to close it first if it's currently open.
func deleteDocument(client: JsBaoClient, documentId: String) async throws {
  // #region example
  try await client.documents.delete(
    documentId: documentId,
    options: DeleteDocumentOptions(forceCloseIfOpen: true)
  )
  // #endregion example
}
