import JsBaoClient

// Check whether OAuth sign-in is configured for this app.
func checkOAuthAvailable(client: JsBaoClient) async {
  // #region example
  let available = await client.checkOAuthAvailable()
  // #endregion example
  _ = available
}
