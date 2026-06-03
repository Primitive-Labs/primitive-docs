import type { JsBaoClient } from "js-bao-wss-client";

// List pending (unresolved, non-expired) invitations scoped to a group, so you
// can render "members + pending" together.
export async function listPendingInvitations(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
) {
  // #region example
  const pending = await client.groups.listPendingInvitations(groupType, groupId);
  // #endregion example
  return pending;
}
