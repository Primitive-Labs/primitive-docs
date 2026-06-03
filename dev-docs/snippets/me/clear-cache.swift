import JsBaoClient

// Clear the cached profile so the next get() fetches fresh from the server.
func clearCache(client: JsBaoClient) async throws {
  // #region example
  await client.me.clearCache()
  // #endregion example
}
