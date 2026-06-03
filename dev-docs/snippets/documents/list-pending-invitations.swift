import JsBaoClient

// List pending (deferred) email invitations scoped to a document as typed
// `[PendingInvitationEntry]`.
func listPendingInvitations(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let pending = try await client.documents.listPendingInvitations(
    documentId: documentId
  )
  let firstEmail = pending.first?.email
  // #endregion example
  _ = firstEmail
}
