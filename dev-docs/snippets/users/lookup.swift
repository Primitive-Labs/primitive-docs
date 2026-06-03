import JsBaoClient

// Find a user by email address.
func lookup(client: JsBaoClient, email: String) async throws {
  // #region example
  let user = try await client.users.lookup(email: email)
  // #endregion example
  _ = user
}
