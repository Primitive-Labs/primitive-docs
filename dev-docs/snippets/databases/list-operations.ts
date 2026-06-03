import type { JsBaoClient } from "js-bao-wss-client";

// List all operations registered on a database.
export async function listOperations(client: JsBaoClient, databaseId: string) {
  // #region example
  const operations = await client.databases.listOperations(databaseId);
  // #endregion example
  return operations;
}
