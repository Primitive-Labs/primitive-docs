import JsBaoClient

// Grant document access to an entire group. All members get the permission;
// access updates automatically as membership changes.
func shareWithGroup(client: JsBaoClient, documentId: String) async throws {
  // #region example
  _ = try await client.documents.grantGroupPermission(
    documentId: documentId,
    params: [
      "groupType": "team",
      "groupId": "engineering-team",
      "permission": "read-write",
    ]
  )
  // #endregion example
}
