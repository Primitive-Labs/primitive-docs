import type { JsBaoClient } from "js-bao-wss-client";

// A collection's members + pending invites in one call.
export async function collectionAccess(client: JsBaoClient, collectionId: string) {
  // #region example
  const access = await client.collections.getAccess(collectionId);
  // #endregion example
  return access;
}
