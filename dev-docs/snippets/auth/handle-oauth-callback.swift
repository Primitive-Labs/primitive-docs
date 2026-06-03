import JsBaoClient

// Complete the OAuth flow with the code + state from the provider redirect.
func handleOAuthCallback(
  client: JsBaoClient,
  code: String,
  state: String
) async throws {
  // #region example
  try await client.handleOAuthCallback(code: code, state: state)
  // #endregion example
}
