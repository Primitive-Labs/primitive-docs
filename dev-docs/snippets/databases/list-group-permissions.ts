import type { JsBaoClient } from "js-bao-wss-client";

// List all group-based permissions for a database.
export async function listGroupPermissions(client: JsBaoClient, databaseId: string) {
  // #region example
  const entries = await client.databases.listGroupPermissions(databaseId, {
    includeSystem: false,
  });
  // #endregion example
  return entries;
}
