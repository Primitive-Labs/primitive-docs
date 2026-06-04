import type { JsBaoClient } from "js-bao-wss-client";

// Start the Google OAuth flow, then complete it on the callback route.
export async function oauthFlow(
  client: JsBaoClient,
  continueUrl: string,
  code: string,
  state: string,
) {
  // #region example
  const hasOAuth = await client.checkOAuthAvailable();
  if (hasOAuth) {
    // Redirects the browser to Google. Code after this does not run on success.
    await client.startOAuthFlow(continueUrl);
  }

  // On the callback route (?code=&state=): token is stored, WS reconnects.
  await client.handleOAuthCallback(code, state);
  // #endregion example
}
