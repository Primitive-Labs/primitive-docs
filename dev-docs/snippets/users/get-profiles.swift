import JsBaoClient

// Batch-fetch several basic profiles in one round-trip.
func getProfiles(client: JsBaoClient, ids: [String]) async throws {
  // #region example
  let profiles: [BatchUserProfile] = try await client.users.getProfiles(userIds: ids)
  let names = profiles.map { $0.name }
  // #endregion example
  _ = names
}
