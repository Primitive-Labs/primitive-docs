import JsBaoClient

// List pending (deferred) email invitations scoped to a document. Swift
// returns an untyped `[[String: Any]]`.
func listPendingInvitations(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let pending = try await client.documents.listPendingInvitations(
    documentId: documentId
  )
  // #endregion example
  _ = pending
}
