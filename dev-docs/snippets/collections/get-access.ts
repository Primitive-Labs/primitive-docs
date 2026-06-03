import type { JsBaoClient } from "js-bao-wss-client";

// Get the current user's access info for a collection (groups + members).
export async function getAccess(client: JsBaoClient, collectionId: string) {
  // #region example
  const access = await client.collections.getAccess(collectionId);
  console.log(access.groups.length, access.members.length);
  // #endregion example
  return access;
}
