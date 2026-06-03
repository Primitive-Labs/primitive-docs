import type { JsBaoClient } from "js-bao-wss-client";

// Check whether a document is read-only for the current user.
export function isReadOnly(client: JsBaoClient, documentId: string) {
  // #region example
  const readOnly = client.documents.isReadOnly(documentId);
  // #endregion example
  return readOnly;
}
