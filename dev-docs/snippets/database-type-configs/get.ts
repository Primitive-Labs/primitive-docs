import type { JsBaoClient } from "js-bao-wss-client";

// Fetch the configuration for one database type.
export async function get(client: JsBaoClient, databaseType: string) {
  // #region example
  const config = await client.databaseTypeConfigs.get(databaseType);
  // #endregion example
  return config;
}
