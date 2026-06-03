import type { JsBaoClient } from "js-bao-wss-client";

// Fires when a document finishes loading (from local store or a fresh server sync).
export function documentLoaded(client: JsBaoClient) {
  // #region example
  client.on("documentLoaded", (payload) => {
    console.log(payload.documentId, "loaded from", payload.source);
  });
  // #endregion example
}
