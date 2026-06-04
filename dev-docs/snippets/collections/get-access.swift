import JsBaoClient

// Get the current user's access info for a collection (groups + members).
func getAccess(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let access = try await client.collections.getAccess(collectionId: collectionId)
  print(access.groups.count, access.members.count)
  // #endregion example
  _ = access
}
