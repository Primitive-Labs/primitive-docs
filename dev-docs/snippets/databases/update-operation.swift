import JsBaoClient

// Update an existing operation's definition or access level.
func updateOperation(client: JsBaoClient, databaseId: String, name: String) async throws {
  // #region example
  let op = try await client.databases.updateOperation(
    databaseId: databaseId,
    name: name,
    params: ["access": "public"]
  )
  // #endregion example
  _ = op
}
