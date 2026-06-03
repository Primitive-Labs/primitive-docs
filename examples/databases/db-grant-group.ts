import type { JsBaoClient } from "js-bao-wss-client";

// Grant an entire group manager-level access to a database.
export async function grantDatabaseToGroup(client: JsBaoClient, databaseId: string) {
  // #region example
  await client.databases.grantGroupPermission(databaseId, {
    groupType: "team",
    groupId: "engineering",
    permission: "manager",
  });
  // #endregion example
}
