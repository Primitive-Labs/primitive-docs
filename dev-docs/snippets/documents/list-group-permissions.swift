import JsBaoClient

// List group-based permissions on a document as typed
// `[DocumentGroupPermissionEntry]`.
func listGroupPermissions(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let groups = try await client.documents.listGroupPermissions(
    documentId: documentId
  )
  let firstGroupId = groups.first?.groupId
  // #endregion example
  _ = firstGroupId
}
