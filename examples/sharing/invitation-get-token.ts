import type { JsBaoClient } from "js-bao-wss-client";

// Fetch an invitation by id and rebuild its accept-page URL from the
// inviteToken — for resending a custom invitation email after the
// original mint response is gone.
export async function buildAcceptUrl(
  client: JsBaoClient,
  invitationId: string,
  baseUrl: string,
) {
  // #region example
  const inv = await client.invitations.get(invitationId);
  const acceptUrl = `${baseUrl}/invite/accept?inviteToken=${inv.inviteToken}`;
  // Send `acceptUrl` to `inv.email` from your own email provider.
  // #endregion example
  return acceptUrl;
}
