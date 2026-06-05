import JsBaoClient

// Removal is its own call — there is no `permission: null` form on
// updatePermissions. Ownership transfer hands the document to a new owner.
func removePermissions(
  client: JsBaoClient,
  documentId: String,
  newOwnerId: String
) async throws {
  // #region example
  // Remove a current member by userId:
  try await client.documents.removePermission(
    documentId: documentId, userId: "user-abc"
  )

  // Cancel a pending email-based invite, OR remove a current member
  // matched by email:
  try await client.documents.removePermission(
    documentId: documentId, email: "alice@example.com"
  )

  // Hand the document to a new owner:
  try await client.documents.transferOwnership(
    documentId: documentId, newOwnerId: newOwnerId
  )
  // #endregion example
}
