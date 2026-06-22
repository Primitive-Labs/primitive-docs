import type { JsBaoClient } from "js-bao-wss-client";

// Team-based workspace access: a user creates a team, then a document is shared
// with the whole team. Database operations gate on team membership in CEL —
// e.g. access: "isMemberOf('team', database.metadata.teamId)".
export async function setUpTeamWorkspace(client: JsBaoClient, docId: string) {
  // #region example
  // User creates a team.
  await client.groups.create({
    groupType: "team",
    groupId: "alpha-team",
    name: "Alpha Team",
  });

  // Share a document with the team — every member inherits read-write.
  await client.documents.grantGroupPermission(docId, {
    groupType: "team",
    groupId: "alpha-team",
    permission: "read-write",
  });
  // #endregion example
}
