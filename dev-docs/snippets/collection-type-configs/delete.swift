import JsBaoClient

// Delete a collection type configuration. Where JS resolves to a typed
// `{ success: boolean }`, Swift returns an untyped `[String: Any]` — read
// `success` out of the dict.
func delete(client: JsBaoClient, collectionType: String) async throws {
  // #region example
  let result = try await client.collectionTypeConfigs.delete(collectionType: collectionType)
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
