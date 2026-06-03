import JsBaoClient

// Delete a database.
func deleteDatabase(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let result = try await client.databases.delete(databaseId: databaseId)
  // #endregion example
  _ = result
}
