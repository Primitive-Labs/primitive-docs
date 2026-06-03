import type { JsBaoClient } from "js-bao-wss-client";

// List pending app invitations and cancel one. `delete` cascades — any
// pending email-based shares or group adds attached to the invitation are
// removed in the same operation.
export async function listAndCancelInvitations(
  client: JsBaoClient,
  invitationId: string,
) {
  // #region example
  const { items } = await client.invitations.list();

  await client.invitations.delete(invitationId);
  // #endregion example
  return items;
}
