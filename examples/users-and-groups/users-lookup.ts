import type { JsBaoClient } from "js-bao-wss-client";

// Look up users by id or email; the current user lives on `client.me`.
export async function lookupUsers(client: JsBaoClient, userId: string) {
  // #region example
  // One user's basic profile
  const user = await client.users.getBasic(userId);

  // Batch-fetch several profiles in one round-trip
  const profiles = await client.users.getProfiles([userId, "user-456"]);

  // Find a user by email
  const found = await client.users.lookup("alice@example.com");

  // The current signed-in user
  const me = await client.me.get();
  // #endregion example
  return { user, profiles, found, me };
}
