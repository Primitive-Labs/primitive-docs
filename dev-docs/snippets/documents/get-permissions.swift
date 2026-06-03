import JsBaoClient

// List the users who have permissions on a document as typed
// `[DocumentPermissionEntry]`.
func getPermissions(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let members = try await client.documents.getPermissions(documentId: documentId)
  let firstEmail = members.first?.email
  // #endregion example
  _ = firstEmail
}
