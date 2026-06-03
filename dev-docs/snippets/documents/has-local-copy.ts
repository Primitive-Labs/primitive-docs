import type { JsBaoClient } from "js-bao-wss-client";

// Check whether a document has a local copy stored on this device.
export function hasLocalCopy(client: JsBaoClient, documentId: string) {
  // #region example
  const local = client.documents.hasLocalCopy(documentId);
  // #endregion example
  return local;
}
