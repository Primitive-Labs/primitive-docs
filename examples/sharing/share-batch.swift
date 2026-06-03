import JsBaoClient

// A single batch share can mix user-id grants and email grants. Email grants
// resolve immediately for existing users, or stay pending until signup.
func shareBatch(client: JsBaoClient, documentId: String) async throws {
  // #region example
  _ = try await client.documents.updatePermissions(
    documentId: documentId,
    params: [
      "permissions": [
        ["userId": "user-abc", "permission": "read-write"],
        ["email": "alice@example.com", "permission": "reader"],
        ["email": "bob@example.com", "permission": "read-write"],
      ]
    ]
  )
  // #endregion example
}
