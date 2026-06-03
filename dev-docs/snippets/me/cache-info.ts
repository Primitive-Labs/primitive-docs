import type { JsBaoClient } from "js-bao-wss-client";

// Read cache metadata for the current user's profile entry.
export async function cacheInfo(client: JsBaoClient) {
  // #region example
  const { updatedAt, ageMs } = await client.me.cacheInfo();
  // #endregion example
  return { updatedAt, ageMs };
}
