import type { JsBaoClient } from "js-bao-wss-client";

// Execute a registered operation by name, with optional params and pagination.
export async function executeOperation(
  client: JsBaoClient,
  databaseId: string,
  name: string,
) {
  // #region example
  const result = await client.databases.executeOperation(databaseId, name, {
    params: { status: "active" },
    limit: 25,
  });
  // #endregion example
  return result;
}
