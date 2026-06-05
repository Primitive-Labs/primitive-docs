import JsBaoClient

// Revoke a user's access, or cancel a pending email invitation. `target` mirrors
// the JS `string | { userId } | { email }` union (a bare string is a user id).
func removePermission(client: JsBaoClient, documentId: String) async throws {
  // #region example
  try await client.documents.removePermission(
    documentId: documentId, .email("teammate@example.com")
  )
  // or: .userId("user-abc")  /  a bare string literal == .userId
  // #endregion example
}
