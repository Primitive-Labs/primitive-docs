import type { JsBaoClient } from "js-bao-wss-client";

// Get all current awareness states for a document.
export function getAwarenessStates(client: JsBaoClient, documentId: string) {
  // #region example
  const states = client.documents.getAwarenessStates(documentId);
  // #endregion example
  return states; // Map<string, any>
}
