import JsBaoClient

// List all aliases pointing at a document as typed `[DocumentAliasInfo]`.
func aliasesListForDocument(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let aliases = try await client.documents.aliases.listForDocument(
    documentId: documentId
  )
  let firstKey = aliases.first?.aliasKey
  // #endregion example
  _ = firstKey
}
