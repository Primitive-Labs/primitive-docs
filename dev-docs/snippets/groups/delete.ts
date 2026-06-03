import type { JsBaoClient } from "js-bao-wss-client";

// Delete a group by its type and ID. Returns `{ success: boolean }`.
export async function deleteGroup(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
) {
  // #region example
  const { success } = await client.groups.delete(groupType, groupId);
  // #endregion example
  return success;
}
