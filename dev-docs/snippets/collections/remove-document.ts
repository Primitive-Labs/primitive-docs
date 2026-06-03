import type { JsBaoClient } from "js-bao-wss-client";

// Remove a document from a collection. Returns `{ success: boolean }`.
export async function removeDocument(
  client: JsBaoClient,
  collectionId: string,
  documentId: string,
) {
  // #region example
  const { success } = await client.collections.removeDocument(
    collectionId,
    documentId,
  );
  // #endregion example
  return success;
}
