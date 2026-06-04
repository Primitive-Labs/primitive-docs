import JsBaoClient

// List every database the group has access to, with the granted permission.
// Returns typed `GroupDatabaseInfo` rows.
func listDatabases(client: JsBaoClient, groupType: String, groupId: String) async throws {
  // #region example
  let dbs = try await client.groups.listDatabases(groupType: groupType, groupId: groupId)
  for db in dbs {
    print(db.databaseId, db.title, db.permission)
  }
  // #endregion example
  _ = dbs
}
