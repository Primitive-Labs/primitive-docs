import JsBaoClient

// Add and list group members; list a user's group memberships.
func manageGroupMembers(client: JsBaoClient, userId: String) async throws {
  // #region example
  // Add a member by email (recommended for user-facing flows)
  let result = try await client.groups.addMember(
    groupType: "team", groupId: "engineering",
    params: ["email": "alice@example.com"]
  )

  // ...or by user id (internal / programmatic)
  _ = try await client.groups.addMember(
    groupType: "team", groupId: "engineering",
    params: ["userId": "user-456"]
  )

  // List a group's members
  let members = try await client.groups.listMembers(groupType: "team", groupId: "engineering")

  // List the groups a user belongs to
  let memberships = try await client.groups.listUserMemberships(userId: userId)
  // #endregion example
  _ = (result, members, memberships)
}
