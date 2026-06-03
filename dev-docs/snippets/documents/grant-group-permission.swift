import JsBaoClient

// Grant a group a permission level on a document. Swift takes an untyped
// params dict and returns an untyped `[String: Any]`.
func grantGroupPermission(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let entry = try await client.documents.grantGroupPermission(
    documentId: documentId,
    params: [
      "groupType": "team",
      "groupId": "eng",
      "permission": "read-write",
    ]
  )
  // #endregion example
  _ = entry
}
