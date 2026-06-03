import JsBaoClient

// Deprecated: per-document accept was removed. Returns a typed
// `DocumentAccessResult`.
func acceptInvitation(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.acceptInvitation(documentId: documentId)
  // #endregion example
  _ = result.hasAccess
}
