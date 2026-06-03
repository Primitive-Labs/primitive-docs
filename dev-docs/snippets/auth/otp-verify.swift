import JsBaoClient

// Verify an OTP code and sign the user in. Swift returns an untyped
// `[String: Any]` (no typed `user` / `isNewUser`) and has no `inviteToken`
// option.
func otpVerify(
  client: JsBaoClient,
  email: String,
  code: String
) async throws {
  // #region example
  let result = try await client.otpVerify(email: email, code: code)
  let user = result["user"] as? [String: Any]
  let isNewUser = result["isNewUser"] as? Bool ?? false
  // #endregion example
  _ = (user, isNewUser)
}
