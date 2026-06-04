import JsBaoClient

// Check the caller's remaining invite quota before showing an invite UI.
func checkInviteQuota(client: JsBaoClient) async throws -> Bool {
  // #region example
  let quota = try await client.invitations.quota()
  // ["used": 2, "limit": 5, "remaining": 3, "unlimited": false]

  let remaining = quota["remaining"] as? Int ?? 0
  let unlimited = quota["unlimited"] as? Bool ?? false
  let canInvite = unlimited || remaining > 0
  // #endregion example
  return canInvite
}
