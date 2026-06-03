import type { JsBaoClient } from "js-bao-wss-client";

// Build a deterministic cache key from a base string and optional params.
export function key(client: JsBaoClient) {
  // #region example
  const cacheKey = client.cache.key("posts", { page: 1, sort: "recent" });
  // #endregion example
  return cacheKey;
}
