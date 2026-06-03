import type { JsBaoClient } from "js-bao-wss-client";

// Delete a database type configuration. Resolves to `{ success: boolean }`.
export async function deleteConfig(client: JsBaoClient, databaseType: string) {
  // #region example
  const { success } = await client.databaseTypeConfigs.delete(databaseType);
  // #endregion example
  return success;
}
