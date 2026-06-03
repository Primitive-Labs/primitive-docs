import JsBaoClient

// Create a database instance of a configured database type. The server assigns
// the id and makes the caller its owner.
func createDatabase(client: JsBaoClient) async throws {
  // #region example
  let db = try await client.databases.create(params: [
    "title": "Alpha Project",
    "databaseType": "project", // must match a configured database type
  ])
  // db: ["databaseId": ..., "title": ..., "databaseType": ..., "permission": ...]
  // #endregion example
  _ = db
}
