import type { JsBaoClient } from "js-bao-wss-client";

// Commit a locally-created (localOnly) document to the server.
export async function commitOfflineCreate(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  const result = await client.documents.commitOfflineCreate(documentId, {
    onExists: "link",
  });
  // #endregion example
  return result; // { created, linked?, reason? }
}
