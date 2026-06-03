import JsBaoClient

// Grant a group a permission level on a document with typed
// `GrantGroupPermissionParams`. Returns a `DocumentGroupPermissionEntry`.
func grantGroupPermission(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let entry = try await client.documents.grantGroupPermission(
    documentId: documentId,
    params: GrantGroupPermissionParams(
      groupType: "team", groupId: "eng", permission: "read-write"
    )
  )
  // #endregion example
  _ = entry.permission
}
