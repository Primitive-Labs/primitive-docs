import JsBaoClient

// Check the current user's access to a document as a typed
// `DocumentAccessResult`.
func validateAccess(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let access = try await client.documents.validateAccess(documentId: documentId)
  let hasAccess = access.hasAccess
  // #endregion example
  _ = hasAccess
}
