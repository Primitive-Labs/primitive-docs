import JsBaoClient

// Create a database and a matching group (workspace convention: the group id
// is the database id).
func createWorkspace(client: JsBaoClient, userId: String) async throws {
  // #region example
  // Create the database (the server assigns the id)
  let db = try await client.databases.create(params: [
    "title": "Team Workspace",
    "databaseType": "workspace",
  ])
  let databaseId = db["databaseId"] as? String ?? ""

  // Reuse the database id as the group id, then add the first member
  _ = try await client.groups.create(params: [
    "groupType": "workspace",
    "groupId": databaseId,
    "name": "Team Workspace Members",
  ])
  _ = try await client.groups.addMember(
    groupType: "workspace", groupId: databaseId,
    params: ["userId": userId]
  )
  // #endregion example
}
