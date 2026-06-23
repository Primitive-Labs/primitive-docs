import JsBaoClient

// End-to-end feature-usage tracking: configure auto events on the client, set
// an app-version override once, then log a per-feature action and a pre-auth
// landing event. client.destroy() flushes on teardown, so no manual flush.
func setupFeatureTracking(currentUserUlid: String) -> JsBaoClient {
  // #region example
  let client = JsBaoClient(options: JsBaoClientOptions(
    apiUrl: "https://primitiveapi.com",
    wsUrl: "wss://primitiveapi.com",
    appId: "YOUR_APP_ID",
    analyticsAutoEvents: AnalyticsAutoEventsConfig(
      blobUploadsStart: false,
      blobUploadsSuccess: true,
      blobUploadsFailure: true,
      sessionEnd: true
    )
  ))

  // Set version once after init (or after a deploy notification)
  client.analytics.setAppVersionOverride("2.1.4")

  func trackFeatureUsed(
    _ userUlid: String,
    feature: String,
    action: String,
    context: JSONValue? = nil
  ) {
    client.analytics.logEvent(AnalyticsEventInput(
      action: action,
      feature: feature,
      user_ulid: userUlid,
      context_json: context
    ))
  }

  // Authenticated event
  trackFeatureUsed(currentUserUlid, feature: "reports", action: "report_generated", context: [
    "reportType": "quarterly",
    "format": "pdf",
  ])

  // Pre-auth event (landing page)
  client.analytics.logEvent(AnalyticsEventInput(
    action: "landing_page_view",
    feature: "onboarding",
    user_ulid: AnalyticsEventInput.unauthenticatedUser
  ))
  // #endregion example
  return client
}
