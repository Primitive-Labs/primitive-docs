import type { JsBaoClient } from "js-bao-wss-client";

// Check whether OAuth sign-in is configured for this app.
export async function checkOAuthAvailable(client: JsBaoClient) {
  // #region example
  const available = await client.checkOAuthAvailable();
  // #endregion example
  return available;
}
