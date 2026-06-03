import type { JsBaoClient } from "js-bao-wss-client";

// List the groups a user belongs to. `name` is joined from the group at call
// time; orphan rows (pointing at a deleted group) are skipped.
export async function userMemberships(client: JsBaoClient, userId: string) {
  // #region example
  const memberships = await client.groups.listUserMemberships(userId);
  // [{ groupType, groupId, name, description?, addedAt, addedBy }]
  // #endregion example
  return memberships;
}
