import JsBaoClient

// A collection's members + pending invites in one call.
func collectionAccess(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let access = try await client.collections.getAccess(collectionId: collectionId)
  // #endregion example
  _ = access
}
