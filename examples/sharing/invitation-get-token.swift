import JsBaoClient

// Fetch an invitation by id and rebuild its accept-page URL from the
// inviteToken — for resending a custom invitation email after the
// original mint response is gone.
func buildAcceptUrl(
  client: JsBaoClient,
  invitationId: String,
  baseURL: String
) async throws -> String {
  // #region example
  let inv = try await client.invitations.get(invitationId: invitationId)
  let inviteToken = inv.inviteToken ?? ""
  let acceptUrl = "\(baseURL)/invite/accept?inviteToken=\(inviteToken)"
  // Send `acceptUrl` to `inv.email` from your own email provider.
  // #endregion example
  return acceptUrl
}
