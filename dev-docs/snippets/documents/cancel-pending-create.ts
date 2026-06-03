import type { JsBaoClient } from "js-bao-wss-client";

// Cancel a pending local create, optionally evicting its local data.
export async function cancelPendingCreate(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  await client.documents.cancelPendingCreate(documentId, { evictLocal: true });
  // #endregion example
}
