import JsBaoClient

// Remove access by user ID, or cancel a member/pending grant by email.
func removeShare(
  client: JsBaoClient,
  documentId: String,
  userId: String
) async throws {
  // #region example
  try await client.documents.removePermission(documentId: documentId, .userId(userId))
  try await client.documents.removePermission(documentId: documentId, .email("alice@example.com"))
  // #endregion example
}
