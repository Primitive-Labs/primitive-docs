import JsBaoClient

// Deprecated: prefer `updatePermissions(params:)` with email+permission.
// In Swift this method is named `sendInvitation` and returns an untyped
// `[String: Any]`.
func createInvitation(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.sendInvitation(
    documentId: documentId,
    email: "teammate@example.com",
    permission: "read-write",
    options: ["sendEmail": true]
  )
  // #endregion example
  _ = result
}
