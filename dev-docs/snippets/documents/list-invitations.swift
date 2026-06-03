import JsBaoClient

// Deprecated: prefer `listPendingInvitations`. Swift returns an untyped
// `[[String: Any]]`.
func listInvitations(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let invitations = try await client.documents.listInvitations(
    documentId: documentId
  )
  // #endregion example
  _ = invitations
}
