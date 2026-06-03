import type { JsBaoClient } from "js-bao-wss-client";

// Get collection info by ID. Callers without any access get a 404.
export async function get(client: JsBaoClient, collectionId: string) {
  // #region example
  const collection = await client.collections.get(collectionId);
  // #endregion example
  return collection;
}
