import JsBaoClient

// Delete a collection. Swift returns an untyped `[String: Any]` rather than
// JS's `{ success: boolean }`.
func delete(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let result = try await client.collections.delete(collectionId: collectionId)
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
