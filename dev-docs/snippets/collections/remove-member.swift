import JsBaoClient

// Remove a member from a collection. Returns `SuccessResult { success }`.
func removeMember(
  client: JsBaoClient,
  collectionId: String,
  userId: String
) async throws {
  // #region example
  let result = try await client.collections.removeMember(
    collectionId: collectionId,
    userId: userId
  )
  let success = result.success
  // #endregion example
  _ = success
}
