import JsBaoClient

// List all operations registered on a database.
func listOperations(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let operations = try await client.databases.listOperations(databaseId: databaseId)
  // #endregion example
  _ = operations
}
