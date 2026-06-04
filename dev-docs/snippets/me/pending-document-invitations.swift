import JsBaoClient

// List pending document invitations for the current user. Swift returns a typed
// `[PendingDocumentInvitation]`.
func pendingDocumentInvitations(client: JsBaoClient) async throws {
  // #region example
  let invitations = try await client.me.pendingDocumentInvitations()
  for invite in invitations {
    print(invite.invitationId, invite.documentId, invite.permission)
  }
  // #endregion example
  _ = invitations
}
