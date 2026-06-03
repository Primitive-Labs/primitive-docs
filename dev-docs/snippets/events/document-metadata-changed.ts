import type { JsBaoClient } from "js-bao-wss-client";

// Fires when a document's metadata (title, tags, etc.) is created, updated, or removed.
export function documentMetadataChanged(client: JsBaoClient) {
  // #region example
  client.on("documentMetadataChanged", (payload) => {
    console.log(payload.documentId, payload.action, "from", payload.source);
  });
  // #endregion example
}
