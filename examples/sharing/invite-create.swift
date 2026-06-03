import JsBaoClient

// Invite a new user into the app by email (admin/owner, or member when
// member-invitations are enabled).
func inviteUser(client: JsBaoClient) async throws {
  // #region example
  _ = try await client.invitations.create(params: [
    "email": "alice@example.com",
    "role": "member",
  ])
  // #endregion example
}
