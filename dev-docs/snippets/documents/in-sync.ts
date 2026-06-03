import type { JsBaoClient } from "js-bao-wss-client";

// Check whether client and server hold identical document state.
export async function inSync(client: JsBaoClient, documentId: string) {
  // #region example
  const synced = await client.documents.inSync(documentId);
  // #endregion example
  return synced;
}
