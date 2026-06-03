import type { JsBaoClient } from "js-bao-wss-client";

// Fires when a document is closed (unsubscribed) by this client.
export function documentClosed(client: JsBaoClient) {
  // #region example
  client.on("documentClosed", (payload) => {
    console.log("closed", payload.documentId);
  });
  // #endregion example
}
