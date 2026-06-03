import type { JsBaoClient } from "js-bao-wss-client";

// Fetch the configuration for one collection type.
export async function get(client: JsBaoClient, collectionType: string) {
  // #region example
  const config = await client.collectionTypeConfigs.get(collectionType);
  // #endregion example
  return config;
}
