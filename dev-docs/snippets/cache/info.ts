import type { JsBaoClient } from "js-bao-wss-client";

// Read metadata (last update time + age) for a cache entry.
export async function info(client: JsBaoClient) {
  // #region example
  const meta = await client.cache.info("user-profile");
  const updatedAt = meta.updatedAt;
  const ageMs = meta.ageMs;
  // #endregion example
  return { updatedAt, ageMs };
}
