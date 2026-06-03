import type { JsBaoClient } from "js-bao-wss-client";

// List collections that contain a specific document.
export async function listCollectionsForDocument(
  client: JsBaoClient,
  documentId: string,
) {
  // #region example
  const page = await client.collections.listCollectionsForDocument(documentId, {
    limit: 50,
  });
  // #endregion example
  return page.items;
}
