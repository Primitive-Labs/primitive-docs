import JsBaoClient

// Transfer document ownership to another user. Returns `Void`.
func transferOwnership(
  client: JsBaoClient, documentId: String, newOwnerId: String
) async throws {
  // #region example
  try await client.documents.transferOwnership(
    documentId: documentId, newOwnerId: newOwnerId
  )
  // #endregion example
}
