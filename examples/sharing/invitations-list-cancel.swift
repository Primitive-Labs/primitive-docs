import JsBaoClient

// List pending app invitations and cancel one. `delete` cascades — any
// pending email-based shares or group adds attached to the invitation are
// removed in the same operation.
func listAndCancelInvitations(
  client: JsBaoClient,
  invitationId: String
) async throws {
  // #region example
  let list = try await client.invitations.list()

  _ = try await client.invitations.delete(invitationId: invitationId)
  // #endregion example
  _ = list
}
