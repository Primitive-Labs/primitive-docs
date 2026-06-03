import JsBaoClient

// Fetch the full auth configuration. Swift returns an untyped `[String: Any]`
// where JS exposes a typed object — read the 14 fields by key.
func getAuthConfig(client: JsBaoClient) async throws {
  // #region example
  let config = try await client.getAuthConfig()
  let googleOAuthEnabled = config["googleOAuthEnabled"] as? Bool ?? false
  // #endregion example
  _ = googleOAuthEnabled
}
