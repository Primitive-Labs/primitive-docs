import type { JsBaoClient } from "js-bao-wss-client";

// Redeem an invite token (resolves all linked deferred grants to the caller).
export async function acceptInvitation(client: JsBaoClient, inviteToken: string) {
  // #region example
  const result = await client.invitations.accept(inviteToken);
  // #endregion example
  return result;
}
