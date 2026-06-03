import type { JsBaoClient } from "js-bao-wss-client";

// Evict all locally stored document data. `onlySynced` preserves docs with
// unsynced changes.
export async function evictAll(client: JsBaoClient) {
  // #region example
  await client.documents.evictAll({ onlySynced: true });
  // #endregion example
}
