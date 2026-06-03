import JsBaoClient

// Withdraw a pending invitation — and any pending document shares or group
// adds attached to it — by deleting the invitation itself.
func cancelInvitation(
  client: JsBaoClient,
  invitationId: String
) async throws {
  // #region example
  _ = try await client.invitations.delete(invitationId: invitationId)
  // #endregion example
}
