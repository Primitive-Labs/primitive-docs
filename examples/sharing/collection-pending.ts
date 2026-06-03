import type { JsBaoClient } from "js-bao-wss-client";

// Pending (not-yet-resolved) email invitations attached to a collection.
export async function collectionPendingInvitations(
  client: JsBaoClient,
  collectionId: string,
) {
  // #region example
  const pending = await client.collections.listPendingInvitations(collectionId);
  // [{ email, permission, invitationId, ... }]
  // #endregion example
  return pending;
}
