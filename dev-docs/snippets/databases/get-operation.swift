import JsBaoClient

// Get a single operation by name.
func getOperation(client: JsBaoClient, databaseId: String, name: String) async throws {
  // #region example
  let op = try await client.databases.getOperation(databaseId: databaseId, name: name)
  // #endregion example
  _ = op
}
