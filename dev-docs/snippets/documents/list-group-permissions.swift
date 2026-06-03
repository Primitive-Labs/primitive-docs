import JsBaoClient

// List group-based permissions on a document as typed
// `[DocumentGroupPermissionEntry]`. Pass `includeSystem: true` to surface
// platform-managed internal groups (admin tooling).
func listGroupPermissions(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let groups = try await client.documents.listGroupPermissions(
    documentId: documentId, includeSystem: false
  )
  let firstGroupId = groups.first?.groupId
  // #endregion example
  _ = firstGroupId
}
