import type { JsBaoClient } from "js-bao-wss-client";

// A typical "invite a teammate and share a project with them" flow. When the
// new user signs up, all three pending actions apply atomically.
export async function inviteAndShare(client: JsBaoClient, projectDocId: string) {
  // #region example
  // 1. Member (quota-checked) invites a teammate
  const quota = await client.invitations.quota();
  if (!quota.unlimited && quota.remaining <= 0) return; // showUpgradePrompt()

  await client.invitations.create({
    email: "newhire@example.com",
    role: "member",
  });

  // 2. Share the project document with them (pending until signup)
  await client.documents.updatePermissions(projectDocId, {
    email: "newhire@example.com",
    permission: "read-write",
  });

  // 3. Also add them to the engineering group (pending until signup)
  await client.groups.addMember("team", "engineering", {
    email: "newhire@example.com",
  });
  // #endregion example
}
