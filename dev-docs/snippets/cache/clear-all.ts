import type { JsBaoClient } from "js-bao-wss-client";

// Remove every entry from the cache.
export async function clearAll(client: JsBaoClient) {
  // #region example
  await client.cache.clearAll();
  // #endregion example
}
