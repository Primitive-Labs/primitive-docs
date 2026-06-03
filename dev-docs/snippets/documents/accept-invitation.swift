import JsBaoClient

// Deprecated: per-document accept was removed. Swift returns an untyped
// `[String: Any]`.
func acceptInvitation(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.acceptInvitation(documentId: documentId)
  // #endregion example
  _ = result
}
