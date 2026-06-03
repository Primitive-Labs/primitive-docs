import type { JsBaoClient } from "js-bao-wss-client";

// Create an app-level invitation. Only `email` is required.
export async function create(client: JsBaoClient, email: string) {
  // #region example
  const invitation = await client.invitations.create({
    email,
    role: "member",
    sendEmail: true,
  });
  // #endregion example
  return invitation.invitationId;
}
