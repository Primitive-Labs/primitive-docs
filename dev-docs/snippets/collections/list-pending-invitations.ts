import type { JsBaoClient } from "js-bao-wss-client";

// List pending (deferred, non-expired) invitations for a collection.
export async function listPendingInvitations(
  client: JsBaoClient,
  collectionId: string,
) {
  // #region example
  const pending = await client.collections.listPendingInvitations(collectionId);
  for (const invite of pending) {
    console.log(invite.email, invite.permission, invite.expiresAt);
  }
  // #endregion example
  return pending;
}
