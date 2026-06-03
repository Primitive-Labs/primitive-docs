import type { JsBaoClient } from "js-bao-wss-client";

// Remove a single entry from the cache by key.
export async function clear(client: JsBaoClient) {
  // #region example
  await client.cache.clear("user-profile");
  // #endregion example
}
