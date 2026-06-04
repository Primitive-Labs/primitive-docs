import JsBaoClient

// Update a database's title or type.
func update(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let db = try await client.databases.update(
    databaseId: databaseId,
    params: UpdateDatabaseParams(title: "Renamed catalog")
  )
  // #endregion example
  _ = db
}
