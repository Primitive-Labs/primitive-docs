import JsBaoClient

// Deprecated: prefer `updatePermissions(params:)` (idempotent). Swift returns
// an untyped `[String: Any]`.
func updateInvitation(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.updateInvitation(
    documentId: documentId,
    email: "teammate@example.com",
    permission: "reader"
  )
  // #endregion example
  _ = result
}
