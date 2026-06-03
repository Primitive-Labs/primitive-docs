import JsBaoClient

// Get the current user's access info for a collection. Swift returns an
// untyped `[String: Any]`; dig out `groups`/`members` with dict casts.
func getAccess(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let access = try await client.collections.getAccess(collectionId: collectionId)
  let groups = access["groups"] as? [[String: Any]] ?? []
  let members = access["members"] as? [[String: Any]] ?? []
  // #endregion example
  _ = (groups, members)
}
