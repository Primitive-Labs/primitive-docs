import type { JsBaoClient } from "js-bao-wss-client";

// Fetch the configuration for one group type.
export async function get(client: JsBaoClient, groupType: string) {
  // #region example
  const config = await client.groupTypeConfigs.get(groupType);
  // #endregion example
  return config;
}
