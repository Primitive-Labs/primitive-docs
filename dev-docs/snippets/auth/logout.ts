import type { JsBaoClient } from "js-bao-wss-client";

// Sign the user out: clears auth state, tears down networking, and optionally
// wipes local data / revokes the offline grant.
export async function logout(client: JsBaoClient) {
  // #region example
  await client.logout({ wipeLocal: true, revokeOffline: true });
  // #endregion example
}
