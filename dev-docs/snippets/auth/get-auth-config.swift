import JsBaoClient

// Fetch the full auth configuration via the typed `client.auth` namespace.
// Returns a typed `AuthConfigInfo` with named fields (no string-key lookups).
func getAuthConfig(client: JsBaoClient) async throws {
  // #region example
  let config = try await client.auth.getAuthConfig()
  if config.googleOAuthEnabled {
    // show the Google sign-in button
  }
  // #endregion example
  _ = config
}
