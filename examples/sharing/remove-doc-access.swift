import JsBaoClient

// Remove document access by userId (existing member) or by email. The email
// form removes a current member if one matches, OR cancels the pending
// deferred share for that email if no direct grant exists.
func removeDocAccess(
  client: JsBaoClient,
  documentId: String,
  userId: String
) async throws {
  // #region example
  // Existing user — by userId
  _ = try await client.documents.removePermission(documentId: documentId, userId: userId)

  // By email
  _ = try await client.documents.removePermission(documentId: documentId, email: "alice@example.com")
  // #endregion example
}
