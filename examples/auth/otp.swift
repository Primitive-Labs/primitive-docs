import JsBaoClient

// Email one-time code: request a 6-digit code, then verify it.
func otpFlow(
  client: JsBaoClient,
  email: String,
  code: String
) async throws {
  // #region example
  _ = try await client.auth.otpRequest(email: email)

  // User enters the 6-digit code from the email.
  let result = try await client.auth.otpVerify(email: email, code: code)
  // Token is now stored on the client and the WS auto-connects.
  let user = result.user
  let isNewUser = result.isNewUser ?? false
  // #endregion example
  _ = (user, isNewUser)
}
