import type { JsBaoClient } from "js-bao-wss-client";

// App-level invitations: check quota, invite by email, list, cancel.
export async function manageAppInvitations(client: JsBaoClient, invitationId: string) {
  // #region example
  // The caller's remaining invite quota (admins/owners are unlimited)
  const quota = await client.invitations.quota();

  // Invite someone to the app by email
  const invitation = await client.invitations.create({
    email: "alice@example.com",
    role: "member",
  });

  // Pending invitations
  const { items } = await client.invitations.list();

  // Cancel one
  await client.invitations.delete(invitationId);
  // #endregion example
  return { quota, invitation, items };
}
