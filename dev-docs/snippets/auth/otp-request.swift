import JsBaoClient

// Email a one-time password (OTP) code to the user. Swift returns a bare
// `Bool` (vs JS `{ success }`).
func otpRequest(client: JsBaoClient, email: String) async throws {
  // #region example
  let success = try await client.otpRequest(email: email)
  // #endregion example
  _ = success
}
