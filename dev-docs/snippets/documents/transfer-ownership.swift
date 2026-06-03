import JsBaoClient

// Transfer document ownership to another user. Swift returns an untyped
// `[String: Any]` (vs JS `void`).
func transferOwnership(
  client: JsBaoClient, documentId: String, newOwnerId: String
) async throws {
  // #region example
  let result = try await client.documents.transferOwnership(
    documentId: documentId, newOwnerId: newOwnerId
  )
  // #endregion example
  _ = result
}
