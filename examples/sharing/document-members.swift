import JsBaoClient

// List a document's current members and its pending email invites.
func listDocumentMembers(client: JsBaoClient, documentId: String) async throws {
  // #region example
  // Current members (accepted permission grants)
  let members = try await client.documents.getPermissions(documentId: documentId)

  // Pending email invites on this document
  let pending = try await client.documents.listPendingInvitations(documentId: documentId)
  // #endregion example
  _ = (members, pending)
}
