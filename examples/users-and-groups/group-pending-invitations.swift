import JsBaoClient

// The "pending members" section of a group sharing UI — invited emails that
// haven't resolved to memberships yet.
func listPendingGroupInvites(client: JsBaoClient) async throws {
  // #region example
  let pending = try await client.groups.listPendingInvitations(
    groupType: "team", groupId: "engineering"
  )
  // [["email", "role", "invitationId", "createdAt", "expiresAt", "addedBy"?]]
  // #endregion example
  _ = pending
}
