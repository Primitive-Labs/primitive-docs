import type { JsBaoClient } from "js-bao-wss-client";

// Fires when a document's sync state with the server flips.
export function sync(client: JsBaoClient) {
  // #region example
  client.on("sync", (payload) => {
    console.log(payload.documentId, "synced:", payload.synced);
  });
  // #endregion example
}
