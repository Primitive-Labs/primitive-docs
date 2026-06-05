import JsBaoClient

// Discover databases shared via groups (workspace convention: groupId == databaseId).
func discoverWorkspaceDatabases(client: JsBaoClient, userId: String) async throws {
  // #region example
  let memberships = try await client.groups.listUserMemberships(userId: userId)
  let workspaces = memberships.filter { $0.groupType == "workspace" }

  // Each group id is also the database id — load them
  var databases: [DatabaseInfo] = []
  for g in workspaces {
    databases.append(try await client.databases.get(databaseId: g.groupId))
  }
  // #endregion example
  _ = databases
}
