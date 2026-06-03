import type { JsBaoClient } from "js-bao-wss-client";

// Start registering a new passkey for the current user.
export async function passkeyRegisterStart(client: JsBaoClient) {
  // #region example
  const { options, challengeToken } = await client.passkeyRegisterStart();
  // #endregion example
  return { options, challengeToken };
}
