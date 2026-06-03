import type { JsBaoClient } from "js-bao-wss-client";

// Fetch one user's basic public profile by id.
export async function getBasic(client: JsBaoClient, userId: string) {
  // #region example
  const user = await client.users.getBasic(userId);
  // #endregion example
  return user;
}
