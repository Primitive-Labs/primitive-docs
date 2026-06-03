import JsBaoClient

// Check the current user's access to a document. Swift returns an untyped
// `[String: Any]`.
func validateAccess(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let access = try await client.documents.validateAccess(documentId: documentId)
  let hasAccess = access["hasAccess"] as? Bool ?? false
  // #endregion example
  _ = hasAccess
}
