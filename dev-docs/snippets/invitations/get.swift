import JsBaoClient

// Fetch a single invitation by id. The response includes `inviteToken`, which
// you combine with your app's accept-page URL to build a working CTA. Swift
// returns an untyped `[String: Any]`, so `inviteToken` is read via a cast.
func get(client: JsBaoClient, invitationId: String, baseUrl: String) async throws {
  // #region example
  let invitation = try await client.invitations.get(invitationId: invitationId)
  let inviteToken = invitation["inviteToken"] as? String ?? ""
  let acceptUrl = "\(baseUrl)/invite/accept?inviteToken=\(inviteToken)"
  // #endregion example
  _ = acceptUrl
}
