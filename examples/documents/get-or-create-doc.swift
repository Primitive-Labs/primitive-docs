import JsBaoClient

// Atomic get-or-create of a per-user singleton document, then open it.
func getOrCreateLibrary(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.getOrCreateWithAlias(
    options: GetOrCreateWithAliasOptions(
      alias: AliasRef(scope: .user, aliasKey: "default-doc"),
      title: "My Data"
    )
  )
  _ = try await client.documents.open(result.documentId)
  // #endregion example
}
