import JsBaoClient

// Create a document and assign an alias atomically with typed
// `CreateWithAliasOptions`. Returns a `CreateWithAliasResult` (incl. the id).
func createWithAlias(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.createWithAlias(
    options: CreateWithAliasOptions(
      title: "User Notes",
      alias: AliasRef(scope: .user, aliasKey: "notes")
    )
  )
  // #endregion example
  _ = result.documentId
}
