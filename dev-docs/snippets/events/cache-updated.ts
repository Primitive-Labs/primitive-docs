import type { JsBaoClient } from "js-bao-wss-client";

// Fires when an internal KV cache entry (e.g. the `me` record) refreshes from the server.
export function cacheUpdated(client: JsBaoClient) {
  // #region example
  // `cacheUpdated` is emitted by the cache layer but not in the typed event map,
  // so subscribe through an untyped `on` cast.
  type CacheUpdated = { key: string; updatedAt: string; source: string; value: unknown };
  const on = client.on as (type: string, f: (payload: CacheUpdated) => void) => void;
  on("cacheUpdated", (payload) => {
    console.log("cache refreshed:", payload.key, "from", payload.source);
  });
  // #endregion example
}
