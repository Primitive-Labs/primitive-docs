import type { JsBaoClient } from "js-bao-wss-client";

// Fires when this client's permission level on a document changes.
export function permission(client: JsBaoClient) {
  // #region example
  client.on("permission", (payload) => {
    console.log(payload.documentId, "->", payload.permission);
  });
  // #endregion example
}
