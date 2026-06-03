import JsBaoClient

// Resolve an alias to its document (nil if not found) with a typed `AliasRef`.
// Returns a `DocumentAliasInfo?`.
func aliasesResolve(client: JsBaoClient) async throws {
  // #region example
  let alias = try await client.documents.aliases.resolve(
    AliasRef(scope: .user, aliasKey: "notes")
  )
  let documentId = alias?.documentId
  // #endregion example
  _ = documentId
}
