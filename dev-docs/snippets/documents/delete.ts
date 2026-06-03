import type { JsBaoClient } from "js-bao-wss-client";

// Delete a document from the server and evict its local data.
export async function deleteDocument(client: JsBaoClient, documentId: string) {
  // #region example
  await client.documents.delete(documentId, { forceCloseIfOpen: true });
  // #endregion example
}
