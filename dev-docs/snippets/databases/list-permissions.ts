import type { JsBaoClient } from "js-bao-wss-client";

// List all permission entries for a database.
export async function listPermissions(client: JsBaoClient, databaseId: string) {
  // #region example
  const permissions = await client.databases.listPermissions(databaseId);
  // #endregion example
  return permissions;
}
