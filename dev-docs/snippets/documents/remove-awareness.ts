import type { JsBaoClient } from "js-bao-wss-client";

// Remove awareness states for specific clients (e.g. on timeout).
export function removeAwareness(
  client: JsBaoClient,
  documentId: string,
  clientIds: string[],
) {
  // #region example
  client.documents.removeAwareness(documentId, clientIds, "timeout");
  // #endregion example
}
