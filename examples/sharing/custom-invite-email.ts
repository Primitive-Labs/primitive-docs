import type { JsBaoClient } from "js-bao-wss-client";

// Suppress the platform email and send your own, using the tokenized
// `inviteToken` the invitation exposes to build a CTA URL.
export async function customInviteEmail(client: JsBaoClient) {
  // #region example
  const invitation = await client.invitations.create({
    email: "alice@example.com",
    role: "member",
    sendEmail: false, // suppress the platform email
  });

  const acceptUrl = `https://myapp.example/invite/accept?inviteToken=${invitation.inviteToken}`;
  // await myEmailService.send({ to: invitation.email, link: acceptUrl });
  // #endregion example
  return acceptUrl;
}
