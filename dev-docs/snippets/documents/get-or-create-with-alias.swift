import JsBaoClient

// Resolve an alias to a document, creating one if the alias doesn't exist yet.
// Swift takes the alias as an untyped dict plus separate title/tags args.
func getOrCreateWithAlias(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.getOrCreateWithAlias(
    alias: ["scope": "user", "aliasKey": "notes"],
    title: "User Notes",
    tags: ["scratch"]
  )
  // #endregion example
  _ = result["created"] as? Bool
}
