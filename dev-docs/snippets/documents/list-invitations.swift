import JsBaoClient

// Deprecated: prefer `listPendingInvitations`. Returns typed
// `[DocumentInvitation]`.
func listInvitations(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let invitations = try await client.documents.listInvitations(
    documentId: documentId
  )
  // #endregion example
  _ = invitations
}
