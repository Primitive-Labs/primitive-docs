import type { JsBaoClient } from "js-bao-wss-client";

// Pre-stage a new hire's access by email. Each grant is pending until the
// recipient signs up, then all apply atomically in one transaction.
export async function inviteOnboarding(
  client: JsBaoClient,
  projectDocId: string,
) {
  // #region example
  // 1. Invite a teammate
  await client.invitations.create({ email: "newhire@example.com", role: "member" });

  // 2. Share a project document with them (pending until signup)
  await client.documents.updatePermissions(projectDocId, {
    email: "newhire@example.com",
    permission: "read-write",
  });

  // 3. Add them to the engineering group (pending until signup)
  await client.groups.addMember("team", "engineering", { email: "newhire@example.com" });

  // When they sign up, all three apply in one transaction. They land in the
  // app with team-group access and the project already shared with them.
  // #endregion example
}
