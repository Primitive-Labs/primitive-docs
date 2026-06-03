import JsBaoClient

// List pending (unresolved, non-expired) invitations scoped to a group. Swift
// returns untyped `[[String: Any]]`.
func listPendingInvitations(client: JsBaoClient, groupType: String, groupId: String) async throws {
  // #region example
  let pending = try await client.groups.listPendingInvitations(
    groupType: groupType,
    groupId: groupId
  )
  // #endregion example
  _ = pending
}
