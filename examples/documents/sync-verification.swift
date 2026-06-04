import JsBaoClient

// Confirm the server has received this client's writes before an irreversible
// action (logout, clearing local storage).
//
// Note: Swift's `includesWrites` / `inSync` are synchronous local checks (no
// timeout argument, no WebSocket round-trip) — they read the document
// manager's local sync state directly. The `waitFor*` helpers are async and do
// the round-trip.
func verifySync(client: JsBaoClient, documentId: String) async throws {
  // #region example
  // Point-in-time local checks
  let hasAllWrites = client.documents.includesWrites(documentId: documentId)
  let fullyInSync = client.documents.inSync(documentId: documentId)

  // Polling helpers: wait until confirmed
  try await client.documents.waitForWriteConfirmation(documentId: documentId)
  try await client.documents.waitForInSync(documentId: documentId)
  // #endregion example
  _ = (hasAllWrites, fullyInSync)
}
