import type { JsBaoClient } from "js-bao-wss-client";

// Fires when an internal KV cache entry fails to refresh from the server.
export function cacheUpdateFailed(client: JsBaoClient) {
  // #region example
  // Like `cacheUpdated`, this event isn't in the typed event map — subscribe via an untyped cast.
  type CacheUpdateFailed = { key: string; error: string };
  const on = client.on as (type: string, f: (payload: CacheUpdateFailed) => void) => void;
  on("cacheUpdateFailed", (payload) => {
    console.log("cache refresh failed:", payload.key, payload.error);
  });
  // #endregion example
}
