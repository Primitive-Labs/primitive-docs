import type { JsBaoClient } from "js-bao-wss-client";

// A collection's members + pending invites in one call.
export async function collectionAccess(client: JsBaoClient, collectionId: string) {
  // #region example
  const access = await client.collections.getAccess(collectionId);

  // Or fetch just the pending (not-yet-signed-up) invitations:
  const pending = await client.collections.listPendingInvitations(collectionId);
  // #endregion example
  return { access, pending };
}
