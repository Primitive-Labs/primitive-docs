import type { JsBaoClient } from "js-bao-wss-client";

// Delete a collection type configuration. Resolves to `{ success: boolean }`.
export async function deleteConfig(client: JsBaoClient, collectionType: string) {
  // #region example
  const { success } = await client.collectionTypeConfigs.delete(collectionType);
  // #endregion example
  return success;
}
