import JsBaoClient

// List databases you administer; resolve one by id.
func listAndGetDatabases(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  // Databases where you're owner or manager
  let databases = try await client.databases.list()

  // Resolve a database by id — gated on owner/manager permission, an effective
  // group permission, or app-admin access; otherwise the server returns 403.
  let db = try await client.databases.get(databaseId: databaseId)
  // #endregion example
  _ = (databases, db)
}
