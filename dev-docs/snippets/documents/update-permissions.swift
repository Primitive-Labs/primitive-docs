import JsBaoClient

// Grant or change a user's permission. Build the typed payload with
// `.email(...)`, `.user(...)`, or `.batch(...)`. Returns a
// `PermissionUpdateResult`.
func updatePermissions(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.updatePermissions(
    documentId: documentId,
    params: .email("teammate@example.com", permission: "read-write", sendEmail: true)
  )
  // #endregion example
  _ = result.success
}
