import JsBaoClient

// Fetch the app-launch config subset. Swift returns an untyped `[String: Any]`
// where JS exposes a typed object — read the 7 fields by key.
func getAppConfig(client: JsBaoClient) async throws {
  // #region example
  let config = try await client.getAppConfig()
  let magicLinkEnabled = config["magicLinkEnabled"] as? Bool ?? false
  // #endregion example
  _ = magicLinkEnabled
}
