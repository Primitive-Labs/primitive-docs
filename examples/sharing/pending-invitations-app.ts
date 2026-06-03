import type { JsBaoClient } from "js-bao-wss-client";

// App-wide pending invitations: list all and filter to the not-yet-accepted.
export async function appWidePendingInvitations(client: JsBaoClient) {
  // #region example
  const { items: invitations } = await client.invitations.list();
  const pending = invitations.filter((i) => !i.accepted);
  // [{ invitationId, email, role, invitedAt, expiresAt, source, inviteToken, ... }]
  // #endregion example
  return pending;
}
