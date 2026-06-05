import JsBaoClient

// Tune the lifecycle events the client emits automatically. All options
// default to enabled.
func setupClientWithAutoEvents() -> JsBaoClient {
  // #region example
  let client = JsBaoClient(options: JsBaoClientOptions(
    apiUrl: "https://primitiveapi.com",
    wsUrl: "wss://primitiveapi.com",
    appId: "YOUR_APP_ID",
    analyticsAutoEvents: AnalyticsAutoEventsConfig(
      dailyAuth: true,
      returnActive: true,
      minResumeMs: 5 * 60 * 1000, // gap before another user_returned fires
      syncErrorsEnabled: true,
      syncErrorsMinIntervalMs: 30_000,
      blobUploadsStart: false,
      blobUploadsSuccess: true,
      blobUploadsFailure: true,
      sessionEnd: true
    )
  ))
  // #endregion example
  return client
}
