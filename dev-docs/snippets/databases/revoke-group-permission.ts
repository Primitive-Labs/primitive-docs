import type { JsBaoClient } from "js-bao-wss-client";

// Revoke a group's permission on a database.
export async function revokeGroupPermission(
  client: JsBaoClient,
  databaseId: string,
  groupId: string,
) {
  // #region example
  const result = await client.databases.revokeGroupPermission(
    databaseId,
    "team",
    groupId,
  );
  // #endregion example
  return result;
}
