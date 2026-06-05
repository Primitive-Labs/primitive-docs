import JsBaoClient

// Passwordless email link: request, then verify the token from the callback.
// On Swift `magicLinkRequest` takes an explicit `redirectUri`.
func magicLinkFlow(
  client: JsBaoClient,
  email: String,
  magicToken: String
) async throws {
  // #region example
  // Request the email. Pass the magic-link callback redirect URI.
  _ = try await client.auth.magicLinkRequest(
    email: email,
    redirectUri: "https://app.example.com/auth/magic-callback"
  )

  // On the callback, read the `magic_token` value and verify it.
  let result = try await client.auth.magicLinkVerify(token: magicToken)
  // Token is now stored on the client and the WS auto-connects.
  let user = result.user
  let isNewUser = result.isNewUser ?? false
  // #endregion example
  _ = (user, isNewUser)
}
