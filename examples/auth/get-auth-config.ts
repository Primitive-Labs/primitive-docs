import type { JsBaoClient } from "js-bao-wss-client";

// Discover which auth methods are enabled before rendering any login UI.
export async function discoverAuthMethods(client: JsBaoClient) {
  // #region example
  const config = await client.getAuthConfig();
  // {
  //   appId, name, mode, waitlistEnabled,
  //   googleOAuthEnabled, googleClientId, hasOAuth, redirectUris,
  //   passkeyEnabled, passkeyRpId, passkeyRpName, hasPasskey,
  //   magicLinkEnabled, otpEnabled
  // }

  const methods = {
    google: config.hasOAuth,
    magicLink: config.magicLinkEnabled,
    otp: config.otpEnabled,
    passkey: config.hasPasskey,
  };
  // #endregion example
  return methods;
}
