import JsBaoClient

// Check the caller's remaining invite quota before showing an invite UI.
func checkInviteQuota(client: JsBaoClient) async throws -> Bool {
  // #region example
  let quota = try await client.invitations.quota()
  // InvitationQuota(used: 2, limit: 5, remaining: 3, unlimited: false)

  let canInvite = quota.unlimited || quota.remaining > 0
  // #endregion example
  return canInvite
}
