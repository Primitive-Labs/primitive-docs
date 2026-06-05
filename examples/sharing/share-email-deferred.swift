import JsBaoClient

// Share by email with notification — resolves immediately if the user
// exists, otherwise creates a deferred grant that auto-applies when the
// recipient signs up. With `sendEmail: true`, `documentUrl` is required
// AND the app must have `baseUrl` configured (used to compose the accept
// URL for the deferred-share email). Both preconditions return HTTP 400
// if missing.
func shareByEmailDeferred(
  client: JsBaoClient,
  documentId: String
) async throws {
  // #region example
  let result = try await client.documents.updatePermissions(
    documentId: documentId,
    params: .email(
      "alice@example.com",
      permission: "read-write",
      sendEmail: true,
      documentUrl: "https://app.example.com/lists"
    )
  )
  // Returns a direct grant (existing user) or a deferred grant
  // (invitationId / inviteToken) that the recipient redeems via
  // client.invitations.accept(inviteToken:) after signup.
  // #endregion example
  _ = result
}
