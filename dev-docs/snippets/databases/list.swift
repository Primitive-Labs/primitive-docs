import JsBaoClient

// List the databases the current user can access (optionally filtered by type).
func list(client: JsBaoClient, databaseType: String) async throws {
  // #region example
  let databases = try await client.databases.list(databaseType: databaseType)
  // #endregion example
  _ = databases
}
