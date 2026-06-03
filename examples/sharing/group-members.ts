import type { JsBaoClient } from "js-bao-wss-client";

// Current members of a group.
export async function listGroupMembers(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
) {
  // #region example
  const members = await client.groups.listMembers(groupType, groupId);
  // [{ userId, userName, userEmail, addedAt, addedBy }, ...]
  // #endregion example
  return members;
}
