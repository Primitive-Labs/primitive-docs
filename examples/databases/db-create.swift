import JsBaoClient

// Create a database instance of a configured database type. The server assigns
// the id and makes the caller its owner.
func createDatabase(client: JsBaoClient) async throws {
  // #region example
  let db = try await client.databases.create(params: CreateDatabaseParams(
    title: "Alpha Project",
    databaseType: "project" // must match a configured database type
  ))
  // db: DatabaseInfo { databaseId, title, databaseType, celContext, permission, createdBy, ... }
  // #endregion example
  _ = db
}
