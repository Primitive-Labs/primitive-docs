import type { JsBaoClient } from "js-bao-wss-client";

// Delete a group type configuration. Resolves to `{ success: boolean }`.
export async function deleteConfig(client: JsBaoClient, groupType: string) {
  // #region example
  const { success } = await client.groupTypeConfigs.delete(groupType);
  // #endregion example
  return success;
}
