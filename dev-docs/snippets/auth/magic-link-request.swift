import JsBaoClient

// Email a magic sign-in link to the user. Swift requires an explicit
// `redirectUri` and returns a bare `Bool` (vs JS `{ success }`).
func magicLinkRequest(
  client: JsBaoClient,
  email: String,
  redirectUri: String
) async throws {
  // #region example
  let success = try await client.magicLinkRequest(
    email: email,
    redirectUri: redirectUri
  )
  // #endregion example
  _ = success
}
