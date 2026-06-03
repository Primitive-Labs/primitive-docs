import JsBaoClient

// List pending document invitations for the current user. Swift returns an
// untyped `[[String: Any]]` (JS returns a typed invitation-object array).
func pendingDocumentInvitations(client: JsBaoClient) async throws {
  // #region example
  let invitations = try await client.me.pendingDocumentInvitations()
  for invite in invitations {
    let id = invite["invitationId"] as? String
    let permission = invite["permission"] as? String
    print(id ?? "", permission ?? "")
  }
  // #endregion example
  _ = invitations
}
