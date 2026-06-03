import JsBaoClient

// Read cache metadata for the current user's profile entry. Swift returns a
// typed tuple `(updatedAt: String?, ageMs: Double?)` (JS returns an object).
func cacheInfo(client: JsBaoClient) async throws {
  // #region example
  let info = await client.me.cacheInfo()
  let updatedAt = info.updatedAt
  let ageMs = info.ageMs
  // #endregion example
  _ = (updatedAt, ageMs)
}
