import type { JsBaoClient } from "js-bao-wss-client";

// List pending app invitations, then cancel one.
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
