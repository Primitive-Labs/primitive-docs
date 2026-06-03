import type { JsBaoClient } from "js-bao-wss-client";

// Revoke a group's permission from a collection. Returns `{ success }`.
export async function revokeGroupPermission(
  client: JsBaoClient,
  collectionId: string,
) {
  // #region example
  const { success } = await client.collections.revokeGroupPermission(
    collectionId,
    "team",
    "eng",
  );
  // #endregion example
  return success;
}
