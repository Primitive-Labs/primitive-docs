import JsBaoClient

// Build a deterministic cache key from a base string and optional params.
func key(client: JsBaoClient) {
  // #region example
  let cacheKey = client.cache.key("posts", params: ["page": 1, "sort": "recent"])
  // #endregion example
  _ = cacheKey
}
