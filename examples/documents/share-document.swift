import JsBaoClient

// Share a document by user id, by email, or with an entire group.
func shareDocument(client: JsBaoClient, documentId: String) async throws {
  // #region example
  // By user ID
  _ = try await client.documents.updatePermissions(
    documentId: documentId,
    params: ["userId": "user-abc", "permission": "read-write"]
  )

  // By email — works whether or not the recipient is a member yet
  _ = try await client.documents.updatePermissions(
    documentId: documentId,
    params: ["email": "colleague@example.com", "permission": "read-write"]
  )

  // With a group
  _ = try await client.documents.grantGroupPermission(
    documentId: documentId,
    params: ["groupType": "team", "groupId": "engineering", "permission": "read-write"]
  )
  // #endregion example
}
