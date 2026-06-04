import JsBaoClient

// Look up users by id or email; the current user lives on `client.me`.
func lookupUsers(client: JsBaoClient, userId: String) async throws {
  // #region example
  // One user's basic profile
  let user = try await client.users.getBasic(userId: userId)

  // Batch-fetch several profiles in one round-trip
  let profiles = try await client.users.getProfiles(userIds: [userId, "user-456"])

  // Find a user by email
  let found = try await client.users.lookup(email: "alice@example.com")

  // The current signed-in user
  let me = try await client.me.get()
  // #endregion example
  _ = (user, profiles, found, me)
}
