import JsBaoClient

// Deprecated: no invitee-side decline verb. Swift returns an untyped
// `[String: Any]`.
func declineInvitation(
  client: JsBaoClient, documentId: String, invitationId: String
) async throws {
  // #region example
  let result = try await client.documents.declineInvitation(
    documentId: documentId, invitationId: invitationId
  )
  // #endregion example
  _ = result
}
