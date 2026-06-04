import JsBaoClient

// Grant an entire group manager-level access to a database.
func grantDatabaseToGroup(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  _ = try await client.databases.grantGroupPermission(
    databaseId: databaseId,
    params: ["groupType": "team", "groupId": "engineering", "permission": "manager"]
  )
  // #endregion example
}
