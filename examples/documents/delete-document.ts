import type { JsBaoClient } from "js-bao-wss-client";

// Delete a document. It must be closed first, or pass `forceCloseIfOpen: true`.
// Root documents cannot be deleted.
export async function deleteDocument(client: JsBaoClient, documentId: string) {
  // #region example
  // Must be closed first
  await client.documents.delete(documentId);

  // Force-close before deleting
  await client.documents.delete(documentId, { forceCloseIfOpen: true });
  // #endregion example
}
