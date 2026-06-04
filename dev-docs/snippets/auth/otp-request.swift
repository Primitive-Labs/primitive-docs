import JsBaoClient

// Email a one-time password (OTP) code to the user via the typed `client.auth`
// namespace. Returns a typed `OtpRequestResult` (`success`).
func otpRequest(client: JsBaoClient, email: String) async throws {
  // #region example
  let result = try await client.auth.otpRequest(email: email)
  let success = result.success
  // #endregion example
  _ = success
}
