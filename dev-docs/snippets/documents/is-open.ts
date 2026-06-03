import type { JsBaoClient } from "js-bao-wss-client";

// Check whether a document is currently open (synchronous, local).
export function isOpen(client: JsBaoClient, documentId: string) {
  // #region example
  const open = client.documents.isOpen(documentId);
  // #endregion example
  return open;
}
