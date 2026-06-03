import type { JsBaoClient } from "js-bao-wss-client";

// Add a document to a collection.
export async function addDocument(
  client: JsBaoClient,
  collectionId: string,
  documentId: string,
) {
  // #region example
  const entry = await client.collections.addDocument(collectionId, documentId);
  // #endregion example
  return entry;
}
