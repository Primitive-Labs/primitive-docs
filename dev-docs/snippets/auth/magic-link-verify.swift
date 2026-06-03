import JsBaoClient

// Verify a magic-link token and sign the user in. Swift returns an untyped
// `[String: Any]` (no typed `user` / `isNewUser` / `promptAddPasskey`) and
// has no `inviteToken` option.
func magicLinkVerify(client: JsBaoClient, token: String) async throws {
  // #region example
  let result = try await client.magicLinkVerify(token: token)
  let user = result["user"] as? [String: Any]
  let isNewUser = result["isNewUser"] as? Bool ?? false
  // #endregion example
  _ = (user, isNewUser)
}
