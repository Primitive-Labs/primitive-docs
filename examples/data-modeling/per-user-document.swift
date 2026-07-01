import JsBaoClient

// Single per-user document pattern: atomically get-or-create the user's
// singleton document, open it, then read locally. After open() the document is
// cached on this client, so model reads run against local state.
func loadPersonalData(client: JsBaoClient) async throws {
  // #region example
  // On app load, after sign-in
  let result = try await client.documents.getOrCreateWithAlias(
    options: GetOrCreateWithAliasOptions(
      alias: AliasRef(scope: .user, aliasKey: "default"),
      title: "My Data"
    )
  )
  _ = try await client.documents.open(result.documentId)

  // Reads run against local state after open()
  let openTasks = try Task.query(["completed": false])
  // #endregion example
  _ = openTasks
}
