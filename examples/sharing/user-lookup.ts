import type { JsBaoClient } from "js-bao-wss-client";

// Resolve an email to an app user (to decide whether a share will land
// immediately or stay pending until signup).
export async function lookupUser(client: JsBaoClient) {
  // #region example
  const result = await client.users.lookup("alice@example.com");
  // { exists: true, user: { userId, name, email } } | { exists: false }
  // #endregion example
  return result;
}
