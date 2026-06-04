import JsBaoClient

// Sign in a `+primitivetest` account in an integration test using the magic
// OTP code. The derived account must already exist as a user in the app.
func signInTestUser(client: JsBaoClient) async throws {
  // #region example
  _ = try await client.otpRequest(email: "alice+primitivetest-teacher@example.com")
  _ = try await client.otpVerify(email: "alice+primitivetest-teacher@example.com", code: "000000")
  // client is now authenticated; the access token expires in 30 minutes
  // #endregion example
}
