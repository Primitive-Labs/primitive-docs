import JsBaoClient

// Fetch one user's basic public profile by id.
func getBasic(client: JsBaoClient, userId: String) async throws {
  // #region example
  let user: BasicUserInfo = try await client.users.getBasic(userId: userId)
  let name = user.name
  // #endregion example
  _ = name
}
