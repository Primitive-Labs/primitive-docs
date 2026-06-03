import JsBaoClient

// Check the caller's remaining invite quota before showing an invite UI.
func checkInviteQuota(client: JsBaoClient) async throws {
  // #region example
  let quota = try await client.invitations.quota()
  // { used: 2, limit: 5, remaining: 3, unlimited: false }

  let unlimited = quota["unlimited"] as? Bool ?? false
  let remaining = quota["remaining"] as? Int ?? 0
  if unlimited || remaining > 0 {
    // showInviteButton()
  }
  // #endregion example
}
