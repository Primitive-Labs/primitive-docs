import JsBaoClient

// Check whether the client currently holds a valid auth token via the typed
// `client.auth` namespace (synchronous, local).
func isAuthenticated(client: JsBaoClient) {
  // #region example
  let signedIn = client.auth.isAuthenticated()
  // #endregion example
  _ = signedIn
}
