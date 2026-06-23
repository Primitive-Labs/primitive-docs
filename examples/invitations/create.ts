import type { JsBaoClient } from "js-bao-wss-client";

// Create an app invitation from your app (admin/owner only).
export async function inviteUser(client: JsBaoClient) {
  // #region example
  await client.invitations.create({
    email: "alice@example.com",
    role: "member",
  });
  // #endregion example
}
