import JsBaoClient

// OAuth callback without a client instance: exchange the code statically,
// then persist the token however your app does.
func exchangeCode(
  apiUrl: String,
  appId: String,
  code: String,
  state: String
) async throws -> String {
  // #region example
  let token = try await JsBaoClient.exchangeOAuthCode(
    apiUrl: apiUrl,
    appId: appId,
    code: code,
    state: state
  )
  // Persist however your app does (e.g. Keychain), or pass to the client.
  // #endregion example
  return token
}
