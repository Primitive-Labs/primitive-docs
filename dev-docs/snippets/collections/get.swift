import JsBaoClient

// Get collection info by ID. Callers without any access get a 404.
func get(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let collection = try await client.collections.get(collectionId: collectionId)
  // #endregion example
  _ = collection
}
