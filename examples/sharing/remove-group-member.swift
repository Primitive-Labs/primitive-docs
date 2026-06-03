import JsBaoClient

// Remove a group member by userId (existing member) or by email. The email
// form removes the membership if one exists, OR cancels the pending
// DeferredGroupAdd for that email if no direct membership does.
func removeGroupMember(
  client: JsBaoClient,
  groupType: String,
  groupId: String,
  userId: String
) async throws {
  // #region example
  // Existing member — by userId
  _ = try await client.groups.removeMember(groupType: groupType, groupId: groupId, userId: userId)

  // By email
  _ = try await client.groups.removeMemberByEmail(groupType: groupType, groupId: groupId, email: "alice@example.com")
  // #endregion example
}
