import JsBaoClient

// Delete a collection. Returns `SuccessResult { success }`.
func delete(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let result = try await client.collections.delete(collectionId: collectionId)
  let success = result.success
  // #endregion example
  _ = success
}
