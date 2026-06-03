import type { JsBaoClient } from "js-bao-wss-client";

// Fetch the app-launch config subset (mode, waitlist, available auth methods).
export async function getAppConfig(client: JsBaoClient) {
  // #region example
  const config = await client.getAppConfig();
  if (config.magicLinkEnabled) {
    // offer magic-link sign-in
  }
  // #endregion example
  return config;
}
