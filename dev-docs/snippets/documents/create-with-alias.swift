import JsBaoClient

// Create a document and assign an alias atomically. Swift takes an untyped
// options dict and returns an untyped `[String: Any]` envelope.
func createWithAlias(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.createWithAlias(options: [
    "title": "User Notes",
    "alias": ["scope": "user", "aliasKey": "notes"],
  ])
  // #endregion example
  _ = result
}
