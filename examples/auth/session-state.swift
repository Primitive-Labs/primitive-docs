import JsBaoClient

// Inspect auth state and gate work on auth being ready.
// On Swift the waiters take a `timeout` (seconds); `waitForAuthReady`
// returns `(userId, mode)`.
func sessionState(client: JsBaoClient) async throws {
  // #region example
  let signedIn = client.isAuthenticated() // Bool

  // Wait until a userId is available.
  let userId = try await client.waitForUserId(timeout: 5)

  // Wait until authenticated AND offline DBs are ready. Returns the mode.
  let ready = try await client.waitForAuthReady(timeout: 6)
  // #endregion example
  _ = (signedIn, userId, ready)
}
