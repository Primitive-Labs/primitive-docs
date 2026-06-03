import JsBaoClient

// Static helper: exchange an OAuth code for a token without a client instance.
// Swift takes named arguments (no `refreshProxy*` options) where JS takes a
// single params object.
func exchangeOAuthCode(
  apiUrl: String,
  appId: String,
  code: String,
  state: String
) async throws {
  // #region example
  let token = try await JsBaoClient.exchangeOAuthCode(
    apiUrl: apiUrl,
    appId: appId,
    code: code,
    state: state
  )
  // #endregion example
  _ = token
}
