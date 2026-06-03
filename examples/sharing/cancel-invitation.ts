import type { JsBaoClient } from "js-bao-wss-client";

// Withdraw a pending invitation — and any pending document shares or group
// adds attached to it — by deleting the invitation itself.
export async function cancelInvitation(
  client: JsBaoClient,
  invitationId: string,
) {
  // #region example
  await client.invitations.delete(invitationId);
  // #endregion example
}
