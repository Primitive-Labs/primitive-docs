import JsBaoClient

// Share a document with several people at once, mixing user IDs and emails.
func batchShare(client: JsBaoClient, documentId: String) async throws {
  // #region example
  _ = try await client.documents.updatePermissions(
    documentId: documentId,
    params: .batch([
      PermissionAssignment(userId: "user-abc", permission: "read-write"),
      PermissionAssignment(email: "alice@example.com", permission: "reader"),
      PermissionAssignment(email: "bob@example.com", permission: "read-write"),
    ])
  )
  // #endregion example
}
