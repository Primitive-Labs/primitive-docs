import JsBaoClient

// Share a document with an entire group, then list and revoke the group's
// permission. Member changes inside the group propagate automatically — no
// per-membership permission calls.
func manageGroupPermission(client: JsBaoClient, documentId: String) async throws {
  // #region example
  _ = try await client.documents.grantGroupPermission(
    documentId: documentId,
    params: GrantGroupPermissionParams(groupType: "team", groupId: "engineering", permission: "read-write")
  )

  // Listing / revoking
  _ = try await client.documents.listGroupPermissions(documentId: documentId)
  _ = try await client.documents.revokeGroupPermission(documentId: documentId, groupType: "team", groupId: "engineering")
  // #endregion example
}
