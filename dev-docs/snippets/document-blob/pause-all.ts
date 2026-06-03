import type { JsBaoClient } from "js-bao-wss-client";

export function pauseAll(client: JsBaoClient, documentId: string) {
  // #region example
  const blobs = client.document(documentId).blobs();
  blobs.pauseAll(); // pause every in-progress upload for this document
  // #endregion example
}
