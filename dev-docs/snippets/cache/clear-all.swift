import JsBaoClient

// Remove every entry from the cache.
func clearAll(client: JsBaoClient) async {
  // #region example
  await client.cache.clearAll()
  // #endregion example
}
