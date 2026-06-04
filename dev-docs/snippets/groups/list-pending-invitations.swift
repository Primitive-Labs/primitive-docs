import JsBaoClient

// List pending (unresolved, non-expired) invitations scoped to a group.
// Returns typed `PendingGroupInvitationEntry` rows.
func listPendingInvitations(client: JsBaoClient, groupType: String, groupId: String) async throws {
  // #region example
  let pending = try await client.groups.listPendingInvitations(
    groupType: groupType,
    groupId: groupId
  )
  for invite in pending {
    print(invite.email, invite.role, invite.expiresAt)
  }
  // #endregion example
  _ = pending
}
