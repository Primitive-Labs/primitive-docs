import type { JsBaoClient } from "js-bao-wss-client";

// Fires when collaborator awareness (presence/cursors) changes for a document.
export function awareness(client: JsBaoClient) {
  // #region example
  client.on("awareness", (payload) => {
    // JS delivers deltas: which client IDs were added / updated / removed.
    console.log(payload.documentId, payload.added, payload.updated, payload.removed);
  });
  // #endregion example
}
