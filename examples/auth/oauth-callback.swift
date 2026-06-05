import JsBaoClient

// OAuth callback: complete the flow on an existing client instance.
// `code` and `state` come from the redirect URI delivered to your
// ASWebAuthenticationSession completion handler.
func completeOAuth(client: JsBaoClient, code: String, state: String) async throws {
  // #region example
  if !code.isEmpty && !state.isEmpty {
    try await client.handleOAuthCallback(code: code, state: state)
    // Token now stored, WebSocket reconnected. Navigate.
  }
  // #endregion example
}
