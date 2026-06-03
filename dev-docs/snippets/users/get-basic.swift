import JsBaoClient

// Fetch one user's basic public profile by id.
func getBasic(client: JsBaoClient, userId: String) async throws {
  // #region example
  let user = try await client.users.getBasic(userId: userId)
  // #endregion example
  _ = user
}
