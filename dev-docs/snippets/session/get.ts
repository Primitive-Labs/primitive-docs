import type { JsBaoClient } from "js-bao-wss-client";

// Retrieve information about the current authenticated session as a typed
// `SessionInfo`.
export async function get(client: JsBaoClient) {
  // #region example
  const session = await client.session.get();
  // #endregion example
  return session.sessionId;
}
