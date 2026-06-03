import JsBaoClient

// List the groups a user belongs to. `name` is joined from the group at call
// time; orphan rows (pointing at a deleted group) are skipped.
func userMemberships(client: JsBaoClient, userId: String) async throws {
  // #region example
  let memberships = try await client.groups.listUserMemberships(userId: userId)
  // [["groupType", "groupId", "name", "description"?, "addedAt", "addedBy"]]
  // #endregion example
  _ = memberships
}
