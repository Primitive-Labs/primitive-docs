import type { JsBaoClient } from "js-bao-wss-client";

// Remove a manager from a database.
export async function removeManager(
  client: JsBaoClient,
  databaseId: string,
  userId: string,
) {
  // #region example
  const result = await client.databases.removeManager(databaseId, userId);
  // #endregion example
  return result;
}
