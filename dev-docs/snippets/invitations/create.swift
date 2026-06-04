import JsBaoClient

// Create an app-level invitation. Only `email` is required. Returns a typed
// `AppInvitationInfo`.
func create(client: JsBaoClient, email: String) async throws {
  // #region example
  let invitation = try await client.invitations.create(
    params: CreateInvitationParams(email: email, role: "member", sendEmail: true)
  )
  let invitationId = invitation.invitationId
  // #endregion example
  _ = invitationId
}
