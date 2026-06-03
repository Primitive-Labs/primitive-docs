import type { JsBaoClient } from "js-bao-wss-client";

// List the databases the current user can access (optionally filtered by type).
export async function list(client: JsBaoClient, databaseType: string) {
  // #region example
  const databases = await client.databases.list({ databaseType });
  // #endregion example
  return databases;
}
