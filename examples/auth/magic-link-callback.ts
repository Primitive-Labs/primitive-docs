import type { JsBaoClient } from "js-bao-wss-client";

// Magic-link callback page: the token arrives as `magic_token` (not `token`,
// `magicToken`, or `code`). Verify it, then route by the result flags.
export async function handleMagicLinkCallback(
  client: JsBaoClient,
  showOnboarding: () => void,
  offerPasskeyRegistration: () => void
) {
  // #region example
  const magicToken = new URLSearchParams(window.location.search).get("magic_token");

  if (magicToken) {
    const { user, isNewUser, promptAddPasskey } = await client.magicLinkVerify(magicToken);
    // Token is now stored on the client and WS auto-connects.
    if (isNewUser) showOnboarding();
    if (promptAddPasskey) offerPasskeyRegistration();
    return user;
  }
  // #endregion example
}
