import JsBaoClient

// Deprecated: prefer `client.invitations.get` or `listPendingInvitations`.
// Returns a typed `DocumentInvitation?`.
func getInvitation(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let invitation = try await client.documents.getInvitation(
    documentId: documentId, email: "teammate@example.com"
  )
  // #endregion example
  _ = invitation?.permission
}
