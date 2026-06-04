import type { JsBaoClient } from "js-bao-wss-client";

// Grant manager-level access to every member of a group at once, list/revoke
// those grants, and let group members discover their group-accessible databases.
export async function manageGroupAccess(client: JsBaoClient, databaseId: string) {
  // #region example
  await client.databases.grantGroupPermission(databaseId, {
    groupType: "team",
    groupId: "engineering",
    permission: "manager",
  });

  const groupPerms = await client.databases.listGroupPermissions(databaseId);
  await client.databases.revokeGroupPermission(databaseId, "team", "engineering");

  // Group members discover their group-accessible databases via this
  // (databases.list() does NOT return group-shared databases).
  const dbs = await client.groups.listDatabases("team", "engineering");
  // #endregion example
  return { groupPerms, dbs };
}
