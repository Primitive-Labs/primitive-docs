import JsBaoClient

// Start the Google OAuth flow, then complete it on the callback.
// On Swift `startOAuthFlow` takes an explicit `redirectUri` and returns the
// authorization URL to open in a browser (it does not redirect for you).
func oauthFlow(
  client: JsBaoClient,
  redirectUri: String,
  continueUrl: String,
  code: String,
  state: String
) async throws {
  // #region example
  let hasOAuth = await client.checkOAuthAvailable()
  if hasOAuth {
    // Open this URL in a browser / ASWebAuthenticationSession.
    let authUrl = try await client.startOAuthFlow(
      redirectUri: redirectUri,
      continueUrl: continueUrl
    )
    _ = authUrl
  }

  // On the callback (?code=&state=): token is stored, WS reconnects.
  try await client.handleOAuthCallback(code: code, state: state)
  // #endregion example
}
