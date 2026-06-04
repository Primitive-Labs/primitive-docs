import JsBaoClient

// Verify an OTP code and sign the user in via the typed `client.auth`
// namespace. Returns a typed `OtpVerifyResult` (`user`, `isNewUser?`). On
// success the SDK has already applied the returned access token.
func otpVerify(
  client: JsBaoClient,
  email: String,
  code: String
) async throws {
  // #region example
  let result = try await client.auth.otpVerify(email: email, code: code)
  let user = result.user           // AuthUser: userId, email, name?
  let isNewUser = result.isNewUser ?? false
  // #endregion example
  _ = (user, isNewUser)
}
