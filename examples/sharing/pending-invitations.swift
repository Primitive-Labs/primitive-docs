import JsBaoClient

// Per-resource pending invitations — for "this specific document" or "this
// specific group" panels.
func pendingInvitations(
  client: JsBaoClient,
  documentId: String,
  groupType: String,
  groupId: String
) async throws {
  // #region example
  let docPending = try await client.documents.listPendingInvitations(documentId: documentId)
  // [{ email, permission, invitationId, createdAt, expiresAt, grantedBy? }]

  let groupPending = try await client.groups.listPendingInvitations(groupType: groupType, groupId: groupId)
  // [{ email, role, invitationId, createdAt, expiresAt, addedBy? }]
  // #endregion example
  _ = (docPending, groupPending)
}
