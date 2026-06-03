import type { JsBaoClient } from "js-bao-wss-client";

// Finish passkey sign-in with the browser's WebAuthn credential response.
export async function passkeyAuthFinish(
  client: JsBaoClient,
  credential: unknown,
  challengeToken: string,
) {
  // #region example
  const { user, isNewUser } = await client.passkeyAuthFinish(
    credential,
    challengeToken,
  );
  // #endregion example
  return { user, isNewUser };
}
