import JsBaoClient

// List group-based permissions on a document. Swift returns an untyped
// `[[String: Any]]` and has no `includeSystem` option.
func listGroupPermissions(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let groups = try await client.documents.listGroupPermissions(
    documentId: documentId
  )
  // #endregion example
  _ = groups
}
