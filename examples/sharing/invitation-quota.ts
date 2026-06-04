import type { JsBaoClient } from "js-bao-wss-client";

// Check the caller's remaining invite quota before showing an invite UI.
export async function checkInviteQuota(client: JsBaoClient) {
  // #region example
  const quota = await client.invitations.quota();
  // { used: 2, limit: 5, remaining: 3, unlimited: false }

  const canInvite = quota.unlimited || quota.remaining > 0;
  // #endregion example
  return canInvite;
}
