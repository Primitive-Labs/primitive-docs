import JsBaoClient

// Redeem an invite token (resolves all linked deferred grants to the caller).
func acceptInvitation(client: JsBaoClient, inviteToken: String) async throws {
  // #region example
  let result = try await client.invitations.accept(inviteToken: inviteToken)
  // #endregion example
  _ = result
}
