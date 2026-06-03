import JsBaoClient

// Revoke a user's access, or cancel a pending email invitation. Swift splits
// the JS union into `userId:` / `email:` overloads; both return `Void`.
func removePermission(client: JsBaoClient, documentId: String) async throws {
  // #region example
  try await client.documents.removePermission(
    documentId: documentId, email: "teammate@example.com"
  )
  // #endregion example
}
