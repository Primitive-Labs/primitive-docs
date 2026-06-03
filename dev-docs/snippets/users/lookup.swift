import JsBaoClient

// Find a user by email address.
func lookup(client: JsBaoClient, email: String) async throws {
  // #region example
  let result = try await client.users.lookup(email: email)
  if result.exists, let user = result.user {
    print(user.name)
  }
  // #endregion example
  _ = result
}
