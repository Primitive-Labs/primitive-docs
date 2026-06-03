import type { JsBaoClient } from "js-bao-wss-client";

// Delete an operation from a database.
export async function deleteOperation(
  client: JsBaoClient,
  databaseId: string,
  name: string,
) {
  // #region example
  const result = await client.databases.deleteOperation(databaseId, name);
  // #endregion example
  return result;
}
