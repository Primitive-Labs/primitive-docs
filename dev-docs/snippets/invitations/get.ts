import type { JsBaoClient } from "js-bao-wss-client";

// Fetch a single invitation by id. The response includes `inviteToken`, which
// you combine with your app's accept-page URL to build a working CTA.
export async function get(client: JsBaoClient, invitationId: string, baseUrl: string) {
  // #region example
  const invitation = await client.invitations.get(invitationId);
  const acceptUrl = `${baseUrl}/invite/accept?inviteToken=${invitation.inviteToken}`;
  // #endregion example
  return acceptUrl;
}
