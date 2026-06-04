import JsBaoClient

// List pending app invitations, then cancel one.
func listAndCancelInvitations(
  client: JsBaoClient,
  invitationId: String
) async throws {
  // #region example
  let list = try await client.invitations.list()
  let items = list["items"] as? [[String: Any]] ?? []

  _ = try await client.invitations.delete(invitationId: invitationId)
  // #endregion example
  _ = items
}
