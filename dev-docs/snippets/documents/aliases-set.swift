import JsBaoClient

// Create or update a document alias with typed `SetAliasParams`. Returns a
// `DocumentAliasInfo`.
func aliasesSet(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let alias = try await client.documents.aliases.set(
    SetAliasParams(scope: .user, aliasKey: "notes", documentId: documentId)
  )
  // #endregion example
  _ = alias.documentId
}
