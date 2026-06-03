import JsBaoClient

// Discover databases shared via groups (workspace convention: groupId == databaseId).
func discoverWorkspaceDatabases(client: JsBaoClient, userId: String) async throws {
  // #region example
  let memberships = try await client.groups.listUserMemberships(userId: userId)
  let workspaces = memberships.filter { ($0["groupType"] as? String) == "workspace" }

  // Each group id is also the database id — load them
  var databases: [[String: Any]] = []
  for g in workspaces {
    if let groupId = g["groupId"] as? String {
      databases.append(try await client.databases.get(databaseId: groupId))
    }
  }
  // #endregion example
  _ = databases
}
