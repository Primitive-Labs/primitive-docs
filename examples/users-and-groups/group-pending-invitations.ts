import type { JsBaoClient } from "js-bao-wss-client";

// The "pending members" section of a group sharing UI — invited emails that
// haven't resolved to memberships yet.
export async function listPendingGroupInvites(client: JsBaoClient) {
  // #region example
  const pending = await client.groups.listPendingInvitations("team", "engineering");
  // [{ email, role, invitationId, createdAt, expiresAt, addedBy? }]
  // #endregion example
  return pending;
}
