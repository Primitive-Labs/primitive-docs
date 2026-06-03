import type { JsBaoClient } from "js-bao-wss-client";

// Transfer database ownership to another user.
export async function transferOwnership(
  client: JsBaoClient,
  databaseId: string,
  newOwnerId: string,
) {
  // #region example
  const result = await client.databases.transferOwnership(databaseId, newOwnerId);
  // #endregion example
  return result;
}
