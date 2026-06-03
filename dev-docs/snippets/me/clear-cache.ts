import type { JsBaoClient } from "js-bao-wss-client";

// Clear the cached profile so the next get() fetches fresh from the server.
export async function clearCache(client: JsBaoClient) {
  // #region example
  await client.me.clearCache();
  // #endregion example
}
