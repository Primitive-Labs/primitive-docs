import JsBaoClient

// Revoke a user's access, or cancel a pending email invitation. Swift splits
// the JS union into two overloads (`userId:` / `email:`) and returns an
// untyped `[String: Any]` (vs JS `void`).
func removePermission(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.removePermission(
    documentId: documentId, email: "teammate@example.com"
  )
  // #endregion example
  _ = result
}
