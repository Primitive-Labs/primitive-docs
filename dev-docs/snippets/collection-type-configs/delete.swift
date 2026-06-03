import JsBaoClient

// Delete a collection type configuration. Returns a typed `SuccessResult`
// (`{ success }`).
func delete(client: JsBaoClient, collectionType: String) async throws {
  // #region example
  let result = try await client.collectionTypeConfigs.delete(collectionType: collectionType)
  let success = result.success
  // #endregion example
  _ = success
}
