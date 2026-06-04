import JsBaoClient

// Passwordless email link: request, then verify the token from the callback.
// On Swift `magicLinkRequest` takes an explicit `redirectUri`, and
// `magicLinkVerify` returns the raw `[String: Any]` response.
func magicLinkFlow(
  client: JsBaoClient,
  email: String,
  magicToken: String
) async throws {
  // #region example
  // Request the email. Pass the magic-link callback redirect URI.
  _ = try await client.magicLinkRequest(
    email: email,
    redirectUri: "https://app.example.com/auth/magic-callback"
  )

  // On the callback, read the `magic_token` value and verify it.
  let result = try await client.magicLinkVerify(token: magicToken)
  // Token is now stored on the client and the WS auto-connects.
  let user = result["user"] as? [String: Any]
  let isNewUser = result["isNewUser"] as? Bool ?? false
  // #endregion example
  _ = (user, isNewUser)
}
