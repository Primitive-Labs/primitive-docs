import JsBaoClient

// App-level invitations: check quota, invite by email, list, cancel.
func manageAppInvitations(client: JsBaoClient, invitationId: String) async throws {
  // #region example
  // The caller's remaining invite quota (admins/owners are unlimited)
  let quota = try await client.invitations.quota()

  // Invite someone to the app by email
  let invitation = try await client.invitations.create(params: [
    "email": "alice@example.com",
    "role": "member",
  ])

  // Pending invitations
  let list = try await client.invitations.list()

  // Cancel one
  _ = try await client.invitations.delete(invitationId: invitationId)
  // #endregion example
  _ = (quota, invitation, list)
}
