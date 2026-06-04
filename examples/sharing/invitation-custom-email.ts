import type { JsBaoClient } from "js-bao-wss-client";

// Suppress the platform email and build your own accept-page URL from the
// invitation's inviteToken (for sending branded emails from your own provider).
export async function customInvitationEmail(client: JsBaoClient) {
  // #region example
  const invitation = await client.invitations.create({
    email: "alice@example.com",
    role: "member",
    sendEmail: false, // suppress the platform email
  });

  const acceptUrl = `https://myapp.example/invite/accept?inviteToken=${invitation.inviteToken}`;
  // Send `acceptUrl` to `invitation.email` from your own email provider.
  // #endregion example
  return acceptUrl;
}
