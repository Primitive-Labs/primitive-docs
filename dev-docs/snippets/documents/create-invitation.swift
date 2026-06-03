import JsBaoClient

// Deprecated: prefer `updatePermissions(params:)` with `.email(...)`. In Swift
// this method is named `sendInvitation` and returns a typed
// `DocumentInvitationResponse`.
func createInvitation(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.sendInvitation(
    documentId: documentId,
    email: "teammate@example.com",
    permission: "read-write",
    options: InvitationEmailOptions(sendEmail: true)
  )
  // #endregion example
  _ = result.invitationId
}
