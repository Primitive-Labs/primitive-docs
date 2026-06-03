import JsBaoClient

// Fetch one database's info by id.
func get(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let db = try await client.databases.get(databaseId: databaseId)
  // #endregion example
  _ = db
}
