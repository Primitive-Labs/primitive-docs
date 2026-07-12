import JsBaoClient

// The "pending members" section of a group sharing UI — invited emails that
// haven't resolved to memberships yet.
func listPendingGroupInvites(client: JsBaoClient) async throws {
  // #region example
  let pending = try await client.groups.listPendingInvitations(
    groupType: "team", groupId: "engineering"
  )
  // [["email", "role", "invitationId", "deferredId", "createdAt", "expiresAt", "addedBy"?]]
  // deferredId → invitations.revokeDeferredGrant(deferredId:type: .group) cancels it
  // #endregion example
  _ = pending
}
