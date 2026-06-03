import type { JsBaoClient } from "js-bao-wss-client";

// Fires when a document is opened (subscribed to) by this client.
export function documentOpened(client: JsBaoClient) {
  // #region example
  client.on("documentOpened", (payload) => {
    console.log("opened", payload.documentId);
  });
  // #endregion example
}
