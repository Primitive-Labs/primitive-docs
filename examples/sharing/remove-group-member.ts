import type { JsBaoClient } from "js-bao-wss-client";

// Remove a group member by userId (existing member) or by email. The email
// form removes the membership if one exists, OR cancels the pending
// DeferredGroupAdd for that email if no direct membership does.
export async function removeGroupMember(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
  userId: string,
) {
  // #region example
  // Existing member — by userId
  await client.groups.removeMember(groupType, groupId, userId);

  // By email
  await client.groups.removeMember(groupType, groupId, { email: "alice@example.com" });
  // #endregion example
}
