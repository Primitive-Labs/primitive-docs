import JsBaoClient

// Wait until client and server hold identical document state. Swift throws on
// timeout.
func waitForInSync(client: JsBaoClient, documentId: String) async throws {
  // #region example
  try await client.documents.waitForInSync(documentId: documentId)
  // #endregion example
}
