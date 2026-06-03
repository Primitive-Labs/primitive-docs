import type { JsBaoClient } from "js-bao-wss-client";

// Delete a database.
export async function deleteDatabase(client: JsBaoClient, databaseId: string) {
  // #region example
  const result = await client.databases.delete(databaseId);
  // #endregion example
  return result;
}
