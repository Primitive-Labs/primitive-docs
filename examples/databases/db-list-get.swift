import JsBaoClient

// List databases you administer; resolve one by id.
func listAndGetDatabases(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  // Databases where you're owner or manager
  let databases = try await client.databases.list()

  // Any authenticated user can resolve a database by id
  let db = try await client.databases.get(databaseId: databaseId)
  // #endregion example
  _ = (databases, db)
}
