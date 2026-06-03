import type { JsBaoClient } from "js-bao-wss-client";

// List every group a user belongs to. JS accepts an optional `{ groupType }`
// filter to scope to one group type server-side.
export async function listUserMemberships(client: JsBaoClient, userId: string) {
  // #region example
  const memberships = await client.groups.listUserMemberships(userId, {
    groupType: "team",
  });
  for (const m of memberships) {
    console.log(m.groupType, m.groupId, m.name);
  }
  // #endregion example
  return memberships;
}
