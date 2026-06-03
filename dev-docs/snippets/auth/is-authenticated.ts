import type { JsBaoClient } from "js-bao-wss-client";

// Check whether the client currently holds a valid auth token.
export function isAuthenticated(client: JsBaoClient) {
  // #region example
  const signedIn = client.isAuthenticated();
  // #endregion example
  return signedIn;
}
