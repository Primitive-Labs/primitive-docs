import JsBaoClient

// Grant a group a permission level on a collection. Swift takes an untyped
// params dict and returns an untyped `[String: Any]`.
func grantGroupPermission(
  client: JsBaoClient,
  collectionId: String
) async throws {
  // #region example
  let grant = try await client.collections.grantGroupPermission(
    collectionId: collectionId,
    params: [
      "groupType": "team",
      "groupId": "eng",
      "permission": "read-write",
    ]
  )
  // #endregion example
  _ = grant
}
