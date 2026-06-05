import { JsBaoClient } from "js-bao-wss-client";

// OAuth callback without a client instance: exchange the code statically,
// then persist the token however your app does.
export async function exchangeCode(
  apiUrl: string,
  appId: string,
  code: string,
  state: string
) {
  // #region example
  const token = await JsBaoClient.exchangeOAuthCode({
    apiUrl,
    appId,
    code,
    state,
  });
  // Persist however your app does (storage / cookie / pass to initializeClient)
  // #endregion example
  return token;
}
