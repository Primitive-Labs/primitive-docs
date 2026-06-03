import type { JsBaoClient } from "js-bao-wss-client";

export function uploads(client: JsBaoClient, documentId: string) {
  // #region example
  const blobs = client.document(documentId).blobs();
  // Status of all tracked uploads for this document.
  const statuses = blobs.uploads();
  const pending = statuses.filter((u) => u.status === "pending");
  // #endregion example
  return pending;
}
