import type { JsBaoClient } from "js-bao-wss-client";

// Complete the OAuth flow with the code + state from the provider redirect.
export async function handleOAuthCallback(
  client: JsBaoClient,
  code: string,
  state: string,
) {
  // #region example
  await client.handleOAuthCallback(code, state);
  // #endregion example
}
