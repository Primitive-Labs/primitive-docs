import JsBaoClient

// Revoke a group's permission from a collection. Swift takes positional
// `groupType`/`groupId` and returns an untyped `[String: Any]`.
func revokeGroupPermission(
  client: JsBaoClient,
  collectionId: String
) async throws {
  // #region example
  let result = try await client.collections.revokeGroupPermission(
    collectionId: collectionId,
    groupType: "team",
    groupId: "eng"
  )
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
