import JsBaoClient

// Grant a group permission on a database (only "manager" is supported).
func grantGroupPermission(client: JsBaoClient, databaseId: String, groupId: String) async throws {
  // #region example
  let entry = try await client.databases.grantGroupPermission(
    databaseId: databaseId,
    params: GrantDatabaseGroupPermissionParams(
      groupType: "team",
      groupId: groupId,
      permission: "manager"
    )
  )
  // #endregion example
  _ = entry
}
