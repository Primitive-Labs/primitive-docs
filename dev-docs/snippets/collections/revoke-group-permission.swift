import JsBaoClient

// Revoke a group's permission from a collection. Returns `SuccessResult`.
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
  let success = result.success
  // #endregion example
  _ = success
}
