import JsBaoClient

// Check whether the client currently holds a valid auth token.
func isAuthenticated(client: JsBaoClient) {
  // #region example
  let signedIn = client.isAuthenticated()
  // #endregion example
  _ = signedIn
}
