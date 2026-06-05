import JsBaoClient

// Track activity before sign-in. Events without an authenticated user are
// dropped, so pass the unauthenticated-user constant for landing/sign-up flows.
func logLandingView(client: JsBaoClient) {
  // #region example
  client.analytics.logEvent(AnalyticsEventInput(
    action: "landing_page_view",
    feature: "onboarding",
    user_ulid: AnalyticsEventInput.unauthenticatedUser
  ))
  // #endregion example
}
