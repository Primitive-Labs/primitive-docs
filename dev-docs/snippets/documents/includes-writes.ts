import type { JsBaoClient } from "js-bao-wss-client";

// Check whether the server has all of this client's writes for a document.
export async function includesWrites(client: JsBaoClient, documentId: string) {
  // #region example
  const confirmed = await client.documents.includesWrites(documentId);
  // #endregion example
  return confirmed;
}
