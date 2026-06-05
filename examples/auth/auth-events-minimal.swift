import JsBaoClient

// The minimum auth wiring: one handler, two triggers.
func wireMinimalAuthHandler(
  client: JsBaoClient,
  navigateToLogin: @escaping () -> Void
) -> [EventSubscription] {
  // #region example
  func promptLogin() { navigateToLogin() }
  let failed = client.events.on(.authFailed) { (_: AuthFailedEvent) in promptLogin() }
  let state = client.events.on(.authState) { (event: AuthStateEvent) in
    if !event.authenticated { promptLogin() }
  }
  // #endregion example
  return [failed, state]
}
