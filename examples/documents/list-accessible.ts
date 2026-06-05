import type { JsBaoClient } from "js-bao-wss-client";

// An "everything I can access" surface: combine owned + directly shared
// documents with collection (and group) memberships.
export async function listAccessible(client: JsBaoClient) {
  // #region example
  const owned = await client.me.ownedDocuments();
  const shared = (await client.me.sharedDocuments()).items;
  const collections = await client.collections.list();
  // then iterate collections / groups.listUserMemberships and call
  // collections.listDocuments / groups.listDocuments.
  // #endregion example
  return { owned, shared, collections };
}
