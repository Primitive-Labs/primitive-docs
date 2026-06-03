import JsBaoClient

// Remove a single entry from the cache by key.
func clear(client: JsBaoClient) async {
  // #region example
  await client.cache.clear(key: "user-profile")
  // #endregion example
}
