import JsBaoClient

// Override the `plan` and `app_version` fields stamped on every subsequent
// analytics event. Pass `nil` to clear an override.
func overrides(client: JsBaoClient) {
  // #region example
  client.analytics.setPlanOverride("pro")
  client.analytics.setAppVersionOverride("2.4.1")
  // #endregion example
}
