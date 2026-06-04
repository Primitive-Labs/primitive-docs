import JsBaoClient

// Emit a custom analytics event. `action` and `user_ulid` are required;
// `feature` groups related events for per-feature dashboards.
func logFeatureEvent(client: JsBaoClient, currentUserUlid: String) {
  // #region example
  client.logAnalyticsEvent([
    "action": "photo_uploaded",
    "feature": "gallery",
    "user_ulid": currentUserUlid,
  ])
  // #endregion example
}
