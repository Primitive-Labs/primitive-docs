import type { JsBaoClient } from "js-bao-wss-client";

// Finish passkey registration with the browser's WebAuthn credential response.
export async function passkeyRegisterFinish(
  client: JsBaoClient,
  credential: unknown,
  challengeToken: string,
) {
  // #region example
  const { success } = await client.passkeyRegisterFinish(
    credential,
    challengeToken,
    "MacBook Pro",
  );
  // #endregion example
  return success;
}
