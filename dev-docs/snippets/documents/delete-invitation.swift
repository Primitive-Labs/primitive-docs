import JsBaoClient

// Deprecated: prefer `removePermission(email:)` or
// `client.invitations.delete`. Swift returns an untyped `[String: Any]`.
func deleteInvitation(
  client: JsBaoClient, documentId: String, invitationId: String
) async throws {
  // #region example
  let result = try await client.documents.deleteInvitation(
    documentId: documentId, invitationId: invitationId
  )
  // #endregion example
  _ = result
}
