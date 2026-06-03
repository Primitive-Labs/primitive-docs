import type { JsBaoClient } from "js-bao-wss-client";

// Invite a new user into the app by email (admin/owner, or member when
// member-invitations are enabled).
export async function inviteUser(client: JsBaoClient) {
  // #region example
  await client.invitations.create({
    email: "alice@example.com",
    role: "member",
  });
  // #endregion example
}
