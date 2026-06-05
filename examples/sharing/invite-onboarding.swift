import JsBaoClient

// Pre-stage a new hire's access by email. Each grant is pending until the
// recipient signs up, then all apply atomically in one transaction.
func inviteOnboarding(
  client: JsBaoClient,
  projectDocId: String
) async throws {
  // #region example
  // 1. Invite a teammate
  _ = try await client.invitations.create(
    params: CreateInvitationParams(email: "newhire@example.com", role: "member")
  )

  // 2. Share a project document with them (pending until signup)
  _ = try await client.documents.updatePermissions(
    documentId: projectDocId,
    params: .email("newhire@example.com", permission: "read-write")
  )

  // 3. Add them to the engineering group (pending until signup)
  _ = try await client.groups.addMember(
    groupType: "team",
    groupId: "engineering",
    params: .email("newhire@example.com")
  )

  // When they sign up, all three apply in one transaction. They land in the
  // app with team-group access and the project already shared with them.
  // #endregion example
}
