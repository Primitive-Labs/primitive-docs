import JsBaoClient

// Fetch the app-launch config subset via the typed `client.auth` namespace.
// Returns a typed `AppConfigInfo` (`appId`, `name`, `mode`, `waitlistEnabled`,
// `hasOAuth`, `hasPasskey`, `magicLinkEnabled`).
func getAppConfig(client: JsBaoClient) async throws {
  // #region example
  let config = try await client.auth.getAppConfig()
  let magicLinkEnabled = config.magicLinkEnabled
  // #endregion example
  _ = magicLinkEnabled
}
