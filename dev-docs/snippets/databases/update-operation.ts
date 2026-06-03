import type { JsBaoClient } from "js-bao-wss-client";

// Update an existing operation's definition or access level.
export async function updateOperation(
  client: JsBaoClient,
  databaseId: string,
  name: string,
) {
  // #region example
  const op = await client.databases.updateOperation(databaseId, name, {
    access: "public",
  });
  // #endregion example
  return op;
}
