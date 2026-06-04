import JsBaoClient

// Database access via a registered operation. Create the database, set the
// celContext values its operation CEL reads (e.g. teamId), then call the
// operation — the operation's CEL `access` plus $user.userId substitution does
// the per-row scoping.
func listMyTasks(client: JsBaoClient) async throws {
  // #region example
  let db = try await client.databases.create(params: [
    "title": "Alpha",
    "databaseType": "project",
  ])
  let databaseId = db["databaseId"] as? String ?? ""
  _ = try await client.databases.updateCelContext(
    databaseId: databaseId,
    celContext: ["teamId": "team-1"]
  )

  let result = try await client.databases.executeOperation(
    databaseId: databaseId,
    name: "listMyTasks"
  )
  // #endregion example
  _ = result
}
