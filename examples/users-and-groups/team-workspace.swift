import JsBaoClient

// Team-based workspace access: a user creates a team, then a document is shared
// with the whole team. Database operations gate on team membership in CEL —
// e.g. access: "isMemberOf('team', database.metadata.teamId)".
func setUpTeamWorkspace(client: JsBaoClient, docId: String) async throws {
  // #region example
  // User creates a team.
  _ = try await client.groups.create(params: CreateGroupParams(
    groupType: "team",
    groupId: "alpha-team",
    name: "Alpha Team"
  ))

  // Share a document with the team — every member inherits read-write.
  _ = try await client.documents.grantGroupPermission(
    documentId: docId,
    params: GrantGroupPermissionParams(
      groupType: "team",
      groupId: "alpha-team",
      permission: "read-write"
    )
  )
  // #endregion example
}
