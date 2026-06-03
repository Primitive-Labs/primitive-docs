import type { JsBaoClient } from "js-bao-wss-client";

// Delete a collection. Returns `{ success: boolean }`.
export async function deleteX(client: JsBaoClient, collectionId: string) {
  // #region example
  const { success } = await client.collections.delete(collectionId);
  // #endregion example
  return success;
}
