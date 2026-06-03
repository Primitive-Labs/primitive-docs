import type { JsBaoClient } from "js-bao-wss-client";

// List every database type configuration for the current app.
export async function list(client: JsBaoClient) {
  // #region example
  const configs = await client.databaseTypeConfigs.list();
  // #endregion example
  return configs;
}
