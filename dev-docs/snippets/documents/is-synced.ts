import type { JsBaoClient } from "js-bao-wss-client";

// Check whether a document's local state is synced with the server (local,
// synchronous).
export function isSynced(client: JsBaoClient, documentId: string) {
  // #region example
  const synced = client.documents.isSynced(documentId);
  // #endregion example
  return synced;
}
