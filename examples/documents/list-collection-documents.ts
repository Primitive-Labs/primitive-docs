import type { JsBaoClient } from "js-bao-wss-client";

// Documents the user can access via a collection they're a member of.
export async function listCollectionDocuments(client: JsBaoClient, collectionId: string) {
  // #region example
  const { items, cursor } = await client.collections.listDocuments(collectionId, {
    limit: 50,
  });
  // #endregion example
  return { items, cursor };
}
