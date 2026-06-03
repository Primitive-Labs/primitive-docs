import type { JsBaoClient } from "js-bao-wss-client";

// List every database the group has access to, with the granted permission.
export async function listDatabases(
  client: JsBaoClient,
  groupType: string,
  groupId: string,
) {
  // #region example
  const dbs = await client.groups.listDatabases(groupType, groupId);
  for (const db of dbs) {
    console.log(db.databaseId, db.title, db.permission);
  }
  // #endregion example
  return dbs;
}
