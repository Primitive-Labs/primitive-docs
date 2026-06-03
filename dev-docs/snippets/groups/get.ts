import type { JsBaoClient } from "js-bao-wss-client";

// Retrieve a single group by its type and ID.
export async function get(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
) {
  // #region example
  const group = await client.groups.get(groupType, groupId);
  // #endregion example
  return group;
}
