import JsBaoClient

// Track activity before sign-in. Events without an authenticated user are
// dropped, so pass the unauthenticated-user constant for landing/sign-up flows.
func logLandingView(client: JsBaoClient) {
  // #region example
  client.logAnalyticsEvent([
    "action": "landing_page_view",
    "feature": "onboarding",
    "user_ulid": AnalyticsQueue.unauthenticatedUser,
  ])
  // #endregion example
}
