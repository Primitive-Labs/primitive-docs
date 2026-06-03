import type { JsBaoClient } from "js-bao-wss-client";

// Check the caller's invitation quota. Admins/owners always get `unlimited: true`.
export async function quota(client: JsBaoClient) {
  // #region example
  const quota = await client.invitations.quota();
  const canInvite = quota.unlimited || quota.remaining > 0;
  // #endregion example
  return canInvite;
}
