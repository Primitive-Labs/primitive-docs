import JsBaoClient

// Create an app-level invitation. Swift takes an untyped params dictionary
// (vs JS's typed `CreateInvitationParams`) and returns an untyped `[String: Any]`.
func create(client: JsBaoClient, email: String) async throws {
  // #region example
  let invitation = try await client.invitations.create(params: [
    "email": email,
    "role": "member",
    "sendEmail": true,
  ])
  let invitationId = invitation["invitationId"] as? String
  // #endregion example
  _ = invitationId
}
