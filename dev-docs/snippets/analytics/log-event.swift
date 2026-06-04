import JsBaoClient

// Emit a custom analytics event through the typed `client.analytics`
// namespace. `user_ulid` is optional — the queue fills it from the signed-in
// user (or the `UNAUTHENTICATED` sentinel) when omitted.
func logEvent(client: JsBaoClient, userUlid: String) {
  // #region example
  client.analytics.logEvent(
    AnalyticsEventInput(
      action: "photo_uploaded",
      feature: "gallery",
      user_ulid: userUlid
    )
  )
  // #endregion example
}
