import type { JsBaoClient } from "js-bao-wss-client";

// Get a single operation by name.
export async function getOperation(
  client: JsBaoClient,
  databaseId: string,
  name: string,
) {
  // #region example
  const op = await client.databases.getOperation(databaseId, name);
  // #endregion example
  return op;
}
