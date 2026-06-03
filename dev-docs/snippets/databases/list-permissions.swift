import JsBaoClient

// List all permission entries for a database.
func listPermissions(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let permissions = try await client.databases.listPermissions(databaseId: databaseId)
  // #endregion example
  _ = permissions
}
