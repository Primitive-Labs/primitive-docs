import JsBaoClient

// Emit a "snapshot" analytics event (`action: "_snapshot"`, `feature: "_state"`)
// with arbitrary context. No-ops when there is no signed-in user.
func logSnapshot(client: JsBaoClient) {
  // #region example
  client.analytics.logSnapshot(context: ["screen": "settings", "theme": "dark"])
  // #endregion example
}
