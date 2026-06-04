import JsBaoClient

// Email a magic sign-in link to the user via the typed `client.auth`
// namespace. Swift requires an explicit `redirectUri` and returns a typed
// `MagicLinkRequestResult` (`success`).
func magicLinkRequest(
  client: JsBaoClient,
  email: String,
  redirectUri: String
) async throws {
  // #region example
  let result = try await client.auth.magicLinkRequest(
    email: email,
    redirectUri: redirectUri
  )
  let success = result.success
  // #endregion example
  _ = success
}
