import type { JsBaoClient } from "js-bao-wss-client";

// Evict a single document's local data from the device.
export async function evict(client: JsBaoClient, documentId: string) {
  // #region example
  await client.documents.evict(documentId, { force: true });
  // #endregion example
}
