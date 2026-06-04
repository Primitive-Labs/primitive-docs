import JsBaoClient

// List every group a user belongs to. Pass `groupType:` to filter to one
// group type server-side. Returns typed `GroupMembershipInfo` rows.
func listUserMemberships(client: JsBaoClient, userId: String) async throws {
  // #region example
  let memberships = try await client.groups.listUserMemberships(
    userId: userId,
    groupType: "team"
  )
  for m in memberships {
    print(m.groupType, m.groupId, m.name)
  }
  // #endregion example
  _ = memberships
}
