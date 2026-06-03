import type { JsBaoClient } from "js-bao-wss-client";

// Grant a group permission on a database (only "manager" is supported).
export async function grantGroupPermission(
  client: JsBaoClient,
  databaseId: string,
  groupId: string,
) {
  // #region example
  const entry = await client.databases.grantGroupPermission(databaseId, {
    groupType: "team",
    groupId,
    permission: "manager",
  });
  // #endregion example
  return entry;
}
