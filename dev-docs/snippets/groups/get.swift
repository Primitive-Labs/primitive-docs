import JsBaoClient

// Retrieve a single group by its type and ID.
func get(client: JsBaoClient, groupType: String, groupId: String) async throws {
  // #region example
  let group = try await client.groups.get(groupType: groupType, groupId: groupId)
  // #endregion example
  _ = group
}
