import JsBaoClient

// Create an app invitation from your app (admin/owner only).
func inviteUser(client: JsBaoClient) async throws {
  // #region example
  _ = try await client.invitations.create(
    params: CreateInvitationParams(email: "alice@example.com", role: "member")
  )
  // #endregion example
}
