import JsBaoClient

// List the databases the current user can access.
// Swift's list() takes no arguments — the JS `databaseType` filter is JS-only (#962).
func list(client: JsBaoClient) async throws {
  // #region example
  let databases = try await client.databases.list()
  // #endregion example
  _ = databases
}
