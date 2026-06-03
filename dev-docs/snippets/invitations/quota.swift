import JsBaoClient

// Check the caller's invitation quota. Swift returns an untyped `[String: Any]`,
// so the typed `InvitationQuota` fields are read via dictionary casts.
func quota(client: JsBaoClient) async throws {
  // #region example
  let quota = try await client.invitations.quota()
  let unlimited = quota["unlimited"] as? Bool ?? false
  let remaining = quota["remaining"] as? Int ?? 0
  let canInvite = unlimited || remaining > 0
  // #endregion example
  _ = canInvite
}
