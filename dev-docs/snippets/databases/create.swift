import JsBaoClient

// Create a new database of a given type.
func create(client: JsBaoClient, databaseType: String) async throws {
  // #region example
  let db = try await client.databases.create(params: CreateDatabaseParams(
    title: "Product catalog",
    databaseType: databaseType,
    celContext: ["region": "us-east"]
  ))
  // #endregion example
  _ = db
}
