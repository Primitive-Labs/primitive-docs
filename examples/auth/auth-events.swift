import JsBaoClient

// The canonical auth events, delivered as typed event structs. `authFailed`
// and `authState` are the ones most apps must handle.
func wireAuthEvents(
  client: JsBaoClient,
  redirectToLogin: @escaping () -> Void
) -> [EventSubscription] {
  // #region example
  // Token refresh failed or server invalidated session — prompt re-login.
  let failed = client.events.on(.authFailed) { (event: AuthFailedEvent) in
    redirectToLogin()
  }

  // Token applied successfully (login, refresh, or OAuth callback).
  let success = client.events.on(.authSuccess) { (event: AuthSuccessEvent) in
    // event.cause names the operation that produced the token.
    // Treat unknown values as a generic success — the set may grow.
  }

  // Generic state-machine event — fires on transitions.
  let state = client.events.on(.authState) { (event: AuthStateEvent) in
    // event.authenticated, event.userId, event.mode (NetworkMode)
  }
  // #endregion example
  return [failed, success, state]
}
