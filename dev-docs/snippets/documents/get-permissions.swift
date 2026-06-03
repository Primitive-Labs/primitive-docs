import JsBaoClient

// List the users who have permissions on a document. Swift returns an untyped
// `[[String: Any]]`.
func getPermissions(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let members = try await client.documents.getPermissions(documentId: documentId)
  // #endregion example
  _ = members
}
