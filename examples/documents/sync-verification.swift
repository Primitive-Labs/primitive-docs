import JsBaoClient

// Confirm the server has received this client's writes before an irreversible
// action (logout, clearing local storage). Both checks return false if
// disconnected or timed out.
func verifySync(client: JsBaoClient, documentId: String) async throws {
  // #region example
  // Point-in-time checks
  let hasAllWrites = await client.documents.includesWrites(documentId: documentId)
  let fullyInSync = await client.documents.inSync(documentId: documentId)

  // Polling helpers: wait until confirmed
  _ = await client.documents.waitForWriteConfirmation(documentId: documentId)
  try await client.documents.waitForInSync(documentId: documentId)
  // #endregion example
  _ = (hasAllWrites, fullyInSync)
}
