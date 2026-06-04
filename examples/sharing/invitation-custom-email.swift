import JsBaoClient

// Suppress the platform email and build your own accept-page URL from the
// invitation's inviteToken (for sending branded emails from your own provider).
func customInvitationEmail(client: JsBaoClient) async throws -> String {
  // #region example
  let invitation = try await client.invitations.create(params: [
    "email": "alice@example.com",
    "role": "member",
    "sendEmail": false, // suppress the platform email
  ])

  let inviteToken = invitation["inviteToken"] as? String ?? ""
  let acceptUrl = "https://myapp.example/invite/accept?inviteToken=\(inviteToken)"
  // Send `acceptUrl` to the invitee from your own email provider.
  // #endregion example
  return acceptUrl
}
