import JsBaoClient

// App-wide pending invitations: list all and filter to the not-yet-accepted.
func appWidePendingInvitations(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.invitations.list()
  let invitations = result["items"] as? [[String: Any]] ?? []
  let pending = invitations.filter { ($0["accepted"] as? Bool) != true }
  // [{ invitationId, email, role, invitedAt, expiresAt, source, inviteToken, ... }]
  // #endregion example
  _ = pending
}
