import JsBaoClient

// Grant manager-level access to every member of a group at once, list/revoke
// those grants, and let group members discover their group-accessible databases.
func manageGroupAccess(client: JsBaoClient, databaseId: String) async throws {
  // #region example
  _ = try await client.databases.grantGroupPermission(
    databaseId: databaseId,
    params: GrantDatabaseGroupPermissionParams(
      groupType: "team", groupId: "engineering", permission: "manager"
    )
  )

  let groupPerms = try await client.databases.listGroupPermissions(databaseId: databaseId)
  _ = try await client.databases.revokeGroupPermission(
    databaseId: databaseId, groupType: "team", groupId: "engineering"
  )

  // Group members discover their group-accessible databases via this
  // (databases.list() does NOT return group-shared databases).
  let dbs = try await client.groups.listDatabases(groupType: "team", groupId: "engineering")
  // #endregion example
  _ = (groupPerms, dbs)
}
