import JsBaoClient

// Wait until the server confirms it has all of this client's writes. Swift
// throws on timeout (vs JS returning a boolean).
func waitForWriteConfirmation(client: JsBaoClient, documentId: String) async throws {
  // #region example
  try await client.documents.waitForWriteConfirmation(documentId: documentId)
  // #endregion example
}
