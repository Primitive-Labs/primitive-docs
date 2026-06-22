import JsBaoClient

// Remove a member or cancel a pending invite, and hand a document to a new
// owner. There is no `permission: nil` to remove — removal is its own call.
func managePermissions(
  client: JsBaoClient,
  documentId: String,
  newOwnerId: String
) async throws {
  // #region example
  // Remove a current member by userId (a bare string literal also works):
  try await client.documents.removePermission(documentId: documentId, .userId("user-abc"))

  // Cancel a pending email-based invite, OR remove a current member matched by email:
  try await client.documents.removePermission(documentId: documentId, .email("alice@example.com"))

  try await client.documents.transferOwnership(documentId: documentId, newOwnerId: newOwnerId)
  // #endregion example
}
