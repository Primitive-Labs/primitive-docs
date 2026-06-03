import type { JsBaoClient } from "js-bao-wss-client";

// Check whether a document has a pending local create not yet committed.
export function isPendingCreate(client: JsBaoClient, documentId: string) {
  // #region example
  const pending = client.documents.isPendingCreate(documentId);
  // #endregion example
  return pending;
}
