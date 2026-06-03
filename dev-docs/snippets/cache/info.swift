import JsBaoClient

// Read metadata (last update time + age) for a cache entry.
func info(client: JsBaoClient) async {
  // #region example
  let meta = await client.cache.info(key: "user-profile")
  let updatedAt = meta.updatedAt
  let ageMs = meta.ageMs
  // #endregion example
  _ = (updatedAt, ageMs)
}
