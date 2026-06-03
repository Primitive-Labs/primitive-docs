import type { JsBaoClient } from "js-bao-wss-client";

// Execute a batch of records using a named mutation operation.
export async function executeBatch(
  client: JsBaoClient,
  databaseId: string,
  operationName: string,
) {
  // #region example
  const result = await client.databases.executeBatch(databaseId, operationName, [
    { params: { id: "p1", name: "Widget" } },
    { params: { id: "p2", name: "Gadget" } },
  ]);
  // #endregion example
  return result;
}
