import type { JsBaoClient } from "js-bao-wss-client";

// Add a user as a manager of a database.
export async function addManager(
  client: JsBaoClient,
  databaseId: string,
  userId: string,
) {
  // #region example
  const entry = await client.databases.addManager(databaseId, { userId });
  // #endregion example
  return entry;
}
