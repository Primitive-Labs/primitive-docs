import type { JsBaoClient } from "js-bao-wss-client";

// Start passkey sign-in: returns WebAuthn challenge options for the browser.
export async function passkeyAuthStart(client: JsBaoClient) {
  // #region example
  const { options, challengeToken } = await client.passkeyAuthStart();
  // #endregion example
  return { options, challengeToken };
}
