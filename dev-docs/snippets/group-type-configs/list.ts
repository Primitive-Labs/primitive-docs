import type { JsBaoClient } from "js-bao-wss-client";

// List every group type configuration for the current app.
export async function list(client: JsBaoClient) {
  // #region example
  const configs = await client.groupTypeConfigs.list();
  // #endregion example
  return configs;
}
