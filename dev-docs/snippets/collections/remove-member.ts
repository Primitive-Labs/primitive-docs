import type { JsBaoClient } from "js-bao-wss-client";

// Remove a member from a collection. Returns `{ success: boolean }`.
export async function removeMember(
  client: JsBaoClient,
  collectionId: string,
  userId: string,
) {
  // #region example
  const { success } = await client.collections.removeMember(
    collectionId,
    userId,
  );
  // #endregion example
  return success;
}
