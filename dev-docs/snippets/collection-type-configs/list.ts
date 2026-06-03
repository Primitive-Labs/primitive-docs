import type { JsBaoClient } from "js-bao-wss-client";

// List every collection type configuration for the current app.
export async function list(client: JsBaoClient) {
  // #region example
  const configs = await client.collectionTypeConfigs.list();
  // #endregion example
  return configs;
}
