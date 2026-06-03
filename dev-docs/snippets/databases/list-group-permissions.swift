import JsBaoClient

// List all group-based permissions for a database.
func listGroupPermissions(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  let entries = try await client.databases.listGroupPermissions(
    databaseId: databaseId,
    includeSystem: false
  )
  // #endregion example
  _ = entries
}
