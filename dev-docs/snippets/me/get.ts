import type { JsBaoClient } from "js-bao-wss-client";

// Read the signed-in user's profile, using the cache when available.
export async function get(client: JsBaoClient) {
  // #region example
  const profile = await client.me.get({
    waitForLoad: "localIfAvailableElseNetwork",
    refreshIfOlderThanMs: 60_000,
  });
  // #endregion example
  return profile;
}
