import JsBaoClient

// Remove a member from a collection. Swift returns an untyped `[String: Any]`
// rather than JS's `{ success: boolean }`.
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
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
