import JsBaoClient

// Check the caller's invitation quota. Returns a typed `InvitationQuota`.
func quota(client: JsBaoClient) async throws {
  // #region example
  let quota = try await client.invitations.quota()
  let canInvite = quota.unlimited || quota.remaining > 0
  // #endregion example
  _ = canInvite
}
