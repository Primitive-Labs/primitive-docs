import type { JsBaoClient } from "js-bao-wss-client";

// Get locally cached metadata for a document (null if none stored).
export async function getLocalMetadata(client: JsBaoClient, documentId: string) {
  // #region example
  const metadata = await client.documents.getLocalMetadata(documentId);
  // #endregion example
  return metadata;
}
