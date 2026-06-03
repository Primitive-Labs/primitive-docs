import JsBaoClient

// Read the signed-in user's profile, using the cache when available.
func get(client: JsBaoClient) async throws {
  // #region example
  let profile = try await client.me.get(options: FetchCachedOptions(
    waitForLoad: .localIfAvailableElseNetwork,
    refreshIfOlderThanMs: 60_000
  ))
  // #endregion example
  _ = profile
}
