import JsBaoClient

// Grant a group a permission level on a collection.
func grantGroupPermission(
  client: JsBaoClient,
  collectionId: String
) async throws {
  // #region example
  let grant = try await client.collections.grantGroupPermission(
    collectionId: collectionId,
    params: GrantCollectionGroupPermissionParams(
      groupType: "team",
      groupId: "eng",
      permission: "read-write"
    )
  )
  // #endregion example
  _ = grant
}
