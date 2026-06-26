import type { JsBaoClient } from "js-bao-wss-client";

// List databases you administer; resolve one by id.
export async function listAndGetDatabases(client: JsBaoClient, databaseId: string) {
  // #region example
  // Databases where you're owner or manager
  const databases = await client.databases.list();

  // Resolve a database by id — gated on owner/manager permission, an effective
  // group permission, or app-admin access; otherwise the server returns 403.
  const db = await client.databases.get(databaseId);
  // #endregion example
  return { databases, db };
}
