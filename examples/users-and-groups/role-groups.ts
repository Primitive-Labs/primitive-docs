import type { JsBaoClient } from "js-bao-wss-client";

// Role-based access using group types as roles within a context: an "editor"
// and a "viewer" group per project, each granted a different document
// permission. CEL operations then check isMemberOf('editor', params.projectId)
// to gate writes and the editor-or-viewer union to gate reads.
export async function setUpRoleGroups(client: JsBaoClient, docId: string) {
  // #region example
  // Create role groups for a project.
  await client.groups.create({ groupType: "editor", groupId: "project-1", name: "Project 1 Editors" });
  await client.groups.create({ groupType: "viewer", groupId: "project-1", name: "Project 1 Viewers" });

  // Grant different document permissions per role.
  await client.documents.grantGroupPermission(docId, {
    groupType: "editor",
    groupId: "project-1",
    permission: "read-write",
  });
  await client.documents.grantGroupPermission(docId, {
    groupType: "viewer",
    groupId: "project-1",
    permission: "reader",
  });
  // #endregion example
}
