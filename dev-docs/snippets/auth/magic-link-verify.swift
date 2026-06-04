import JsBaoClient

// Verify a magic-link token and sign the user in via the typed `client.auth`
// namespace. Returns a typed `MagicLinkVerifyResult` (`user`, `isNewUser?`,
// `promptAddPasskey?`). On success the SDK has already applied the access token.
func magicLinkVerify(client: JsBaoClient, token: String) async throws {
  // #region example
  let result = try await client.auth.magicLinkVerify(token: token)
  let user = result.user           // AuthUser: userId, email, name?
  let isNewUser = result.isNewUser ?? false
  // #endregion example
  _ = (user, isNewUser)
}
