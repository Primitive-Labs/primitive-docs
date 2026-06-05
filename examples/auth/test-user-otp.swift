import JsBaoClient

// Sign in a `+primitivetest` account in an integration test using the magic
// OTP code. The derived account must already exist as a user in the app.
func signInTestUser(client: JsBaoClient) async throws {
  // #region example
  // Requires the app owner to have added "alice@example.com" to the app's
  // testAccountBaseEmails whitelist. Then any `alice+primitivetest<suffix>@example.com`
  // derivative becomes a test account that accepts code "000000".
  _ = try await client.auth.otpRequest(email: "alice+primitivetest@example.com")
  _ = try await client.auth.otpVerify(email: "alice+primitivetest@example.com", code: "000000")
  // client is now authenticated; the access token expires in 30 minutes

  // Role-distinguished derivatives (Gmail/Workspace deliver them to the same inbox):
  _ = try await client.auth.otpRequest(email: "alice+primitivetest-teacher@example.com")
  // #endregion example
}
