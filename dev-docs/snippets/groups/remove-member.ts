import type { JsBaoClient } from "js-bao-wss-client";

// Remove a member by userId. The same JS method is overloaded to also accept
// `{ email }` — e.g. `removeMember(groupType, groupId, { email })`.
export async function removeMember(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
  userId: string,
) {
  // #region example
  const { success } = await client.groups.removeMember(groupType, groupId, userId);
  // #endregion example
  return success;
}
