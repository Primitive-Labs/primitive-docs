import JsBaoClient

// Deprecated: prefer `removePermission(email:)` or
// `client.invitations.delete`. Returns a typed `{ success, message }`.
func deleteInvitation(
  client: JsBaoClient, documentId: String, invitationId: String
) async throws {
  // #region example
  let result = try await client.documents.deleteInvitation(
    documentId: documentId, invitationId: invitationId
  )
  // #endregion example
  _ = result.success
}
