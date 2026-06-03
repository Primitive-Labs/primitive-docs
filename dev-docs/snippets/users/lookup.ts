import type { JsBaoClient } from "js-bao-wss-client";

// Find a user by email address.
export async function lookup(client: JsBaoClient, email: string) {
  // #region example
  const user = await client.users.lookup(email);
  // #endregion example
  return user;
}
