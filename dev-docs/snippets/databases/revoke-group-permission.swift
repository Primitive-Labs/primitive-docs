import JsBaoClient

// Revoke a group's permission on a database.
func revokeGroupPermission(client: JsBaoClient, databaseId: String, groupId: String) async throws {
  // #region example
  let result = try await client.databases.revokeGroupPermission(
    databaseId: databaseId,
    groupType: "team",
    groupId: groupId
  )
  // #endregion example
  _ = result
}
