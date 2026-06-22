import JsBaoClient

// Role-based access using group types as roles within a context: an "editor"
// and a "viewer" group per project, each granted a different document
// permission. CEL operations then check isMemberOf('editor', params.projectId)
// to gate writes and the editor-or-viewer union to gate reads.
func setUpRoleGroups(client: JsBaoClient, docId: String) async throws {
  // #region example
  // Create role groups for a project.
  _ = try await client.groups.create(params: CreateGroupParams(
    groupType: "editor", groupId: "project-1", name: "Project 1 Editors"))
  _ = try await client.groups.create(params: CreateGroupParams(
    groupType: "viewer", groupId: "project-1", name: "Project 1 Viewers"))

  // Grant different document permissions per role.
  _ = try await client.documents.grantGroupPermission(
    documentId: docId,
    params: GrantGroupPermissionParams(
      groupType: "editor", groupId: "project-1", permission: "read-write"))
  _ = try await client.documents.grantGroupPermission(
    documentId: docId,
    params: GrantGroupPermissionParams(
      groupType: "viewer", groupId: "project-1", permission: "reader"))
  // #endregion example
}
