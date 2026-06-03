import JsBaoClient

// List all aliases pointing at a document. Swift returns an untyped
// `[[String: Any]]`.
func aliasesListForDocument(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let aliases = try await client.documents.aliases.listForDocument(
    documentId: documentId
  )
  // #endregion example
  _ = aliases
}
