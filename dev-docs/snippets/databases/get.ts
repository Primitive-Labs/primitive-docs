import type { JsBaoClient } from "js-bao-wss-client";

// Fetch one database's info by id.
export async function get(client: JsBaoClient, databaseId: string) {
  // #region example
  const db = await client.databases.get(databaseId);
  // #endregion example
  return db;
}
