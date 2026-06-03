import JsBaoClient

// Suppress the platform email and send your own, using the tokenized
// `inviteToken` the invitation exposes to build a CTA URL.
func customInviteEmail(client: JsBaoClient) async throws {
  // #region example
  let invitation = try await client.invitations.create(params: [
    "email": "alice@example.com",
    "role": "member",
    "sendEmail": false, // suppress the platform email
  ])

  let token = invitation["inviteToken"] as? String ?? ""
  let acceptUrl = "https://myapp.example/invite/accept?inviteToken=\(token)"
  // try await myEmailService.send(to: invitation["email"], link: acceptUrl)
  // #endregion example
  _ = acceptUrl
}
