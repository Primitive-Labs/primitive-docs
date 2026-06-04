import JsBaoClient

// Email one-time code: request a 6-digit code, then verify it.
// On Swift `otpVerify` returns the raw `[String: Any]` response.
func otpFlow(
  client: JsBaoClient,
  email: String,
  code: String
) async throws {
  // #region example
  _ = try await client.otpRequest(email: email)

  // User enters the 6-digit code from the email.
  let result = try await client.otpVerify(email: email, code: code)
  // Token is now stored on the client and the WS auto-connects.
  let user = result["user"] as? [String: Any]
  let isNewUser = result["isNewUser"] as? Bool ?? false
  // #endregion example
  _ = (user, isNewUser)
}
