import JsBaoClient

// Get collection info by ID. Swift returns an untyped `[String: Any]`.
func get(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let collection = try await client.collections.get(collectionId: collectionId)
  // #endregion example
  _ = collection
}
