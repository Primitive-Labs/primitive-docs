import JsBaoClient

// Resolve an alias to a document, creating one if it doesn't exist yet, with
// typed `GetOrCreateWithAliasOptions`. `created` flags whether a doc was made.
func getOrCreateWithAlias(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.getOrCreateWithAlias(
    options: GetOrCreateWithAliasOptions(
      alias: AliasRef(scope: .user, aliasKey: "notes"),
      title: "User Notes",
      tags: ["scratch"]
    )
  )
  // #endregion example
  _ = result.created
}
