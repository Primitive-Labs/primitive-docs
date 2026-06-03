import type { JsBaoClient } from "js-bao-wss-client";

// List databases you administer; resolve one by id.
export async function listAndGetDatabases(client: JsBaoClient, databaseId: string) {
  // #region example
  // Databases where you're owner or manager
  const databases = await client.databases.list();

  // Any authenticated user can resolve a database by id
  const db = await client.databases.get(databaseId);
  // #endregion example
  return { databases, db };
}
