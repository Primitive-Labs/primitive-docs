import JsBaoClient

// Batch-fetch several basic profiles in one round-trip.
func getProfiles(client: JsBaoClient, ids: [String]) async throws {
  // #region example
  let profiles = try await client.users.getProfiles(userIds: ids)
  // #endregion example
  _ = profiles
}
