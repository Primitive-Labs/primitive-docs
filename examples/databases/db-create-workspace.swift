import JsBaoClient

// Create a database and a matching group (workspace convention: the group id
// is the database id).
func createWorkspace(client: JsBaoClient, userId: String) async throws {
  // #region example
  // Create the database (the server assigns the id)
  let db = try await client.databases.create(params: CreateDatabaseParams(
    title: "Team Workspace",
    databaseType: "workspace"
  ))

  // Reuse the database id as the group id, then add the first member
  _ = try await client.groups.create(params: CreateGroupParams(
    groupType: "workspace",
    groupId: db.databaseId,
    name: "Team Workspace Members"
  ))
  _ = try await client.groups.addMember(
    groupType: "workspace", groupId: db.databaseId,
    params: .userId(userId)
  )
  // #endregion example
}
