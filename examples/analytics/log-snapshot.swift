import JsBaoClient

// Record a point-in-time state snapshot for the signed-in user. The user is
// auto-resolved; when no user is authenticated the call is a no-op.
func logSettingsSnapshot(client: JsBaoClient) {
  // #region example
  client.analytics.logSnapshot(context: ["screen": "settings", "tab": "billing"])
  // #endregion example
}
