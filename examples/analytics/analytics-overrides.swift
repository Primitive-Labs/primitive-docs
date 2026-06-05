import JsBaoClient

// Set plan/app-version once on the client; they flow into every subsequent
// event automatically. Pass nil to clear an override.
func setAnalyticsOverrides(client: JsBaoClient) {
  // #region example
  client.analytics.setPlanOverride("pro")
  client.analytics.setAppVersionOverride("2.1.4")

  // Pass nil to clear an override
  client.analytics.setPlanOverride(nil)
  // #endregion example
}
