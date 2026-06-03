import type { JsBaoClient } from "js-bao-wss-client";

// Broadcast the local user's awareness state (e.g. cursor) for a document.
export function setAwareness(client: JsBaoClient, documentId: string) {
  // #region example
  client.documents.setAwareness(documentId, {
    cursor: { line: 12, column: 4 },
  });
  // #endregion example
}
