import JsBaoClient

// Emit a custom analytics event. On Swift the analytics surface is flattened
// onto the client as `logAnalyticsEvent`, taking an untyped dictionary.
func logEvent(client: JsBaoClient, userUlid: String) {
  // #region example
  client.logAnalyticsEvent([
    "action": "photo_uploaded",
    "feature": "gallery",
    "user_ulid": userUlid,
  ])
  // #endregion example
}
