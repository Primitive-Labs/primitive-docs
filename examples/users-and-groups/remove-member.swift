import JsBaoClient

// Remove a member by id, or by email. The email form also cancels a pending
// deferred add for someone who was invited but hasn't signed up yet.
func removeGroupMember(client: JsBaoClient) async throws {
  // #region example
  // By user ID
  _ = try await client.groups.removeMember(
    groupType: "team", groupId: "engineering", userId: "user-456"
  )

  // By email — removes a direct membership if one exists, otherwise cancels
  // the pending DeferredGroupAdd for that email.
  _ = try await client.groups.removeMemberByEmail(
    groupType: "team", groupId: "engineering", email: "alice@example.com"
  )
  // #endregion example
}
