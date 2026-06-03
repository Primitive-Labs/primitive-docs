import JsBaoClient

// Delete an operation from a database.
func deleteOperation(client: JsBaoClient, databaseId: String, name: String) async throws {
  // #region example
  let result = try await client.databases.deleteOperation(databaseId: databaseId, name: name)
  // #endregion example
  _ = result
}
