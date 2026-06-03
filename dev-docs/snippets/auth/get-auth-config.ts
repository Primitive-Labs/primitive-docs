import type { JsBaoClient } from "js-bao-wss-client";

// Fetch the full auth configuration (providers, passkey/OTP/magic-link flags).
export async function getAuthConfig(client: JsBaoClient) {
  // #region example
  const config = await client.getAuthConfig();
  if (config.googleOAuthEnabled) {
    // show the Google sign-in button
  }
  // #endregion example
  return config;
}
