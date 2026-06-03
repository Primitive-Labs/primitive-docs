import type { JsBaoClient } from "js-bao-wss-client";

export function resumeAll(client: JsBaoClient, documentId: string) {
  // #region example
  const blobs = client.document(documentId).blobs();
  blobs.resumeAll(); // resume every paused upload for this document
  // #endregion example
}
