import JsBaoClient

// Current members of a group.
func listGroupMembers(
  client: JsBaoClient,
  groupType: String,
  groupId: String
) async throws {
  // #region example
  let members = try await client.groups.listMembers(groupType: groupType, groupId: groupId)
  // { items: [{ userId, userName, userEmail, addedAt, addedBy }, ...] }
  // #endregion example
  _ = members
}
