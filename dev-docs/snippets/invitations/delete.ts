import type { JsBaoClient } from "js-bao-wss-client";

// Delete an app-level invitation (admin/owner only). Also cascade-deletes any
// linked deferred grants.
export async function deleteInvitation(client: JsBaoClient, invitationId: string) {
  // #region example
  const result = await client.invitations.delete(invitationId);
  // #endregion example
  return result.success;
}
