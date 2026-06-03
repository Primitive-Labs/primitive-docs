import JsBaoClient

// Revoke a group's permission on a document. Swift returns an untyped
// `[String: Any]` (vs JS `{ success }`).
func revokeGroupPermission(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.revokeGroupPermission(
    documentId: documentId, groupType: "team", groupId: "eng"
  )
  // #endregion example
  _ = result
}
