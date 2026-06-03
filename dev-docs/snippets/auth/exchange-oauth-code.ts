import { JsBaoClient } from "js-bao-wss-client";

// Static helper: exchange an OAuth code for a token without a client instance.
export async function exchangeOAuthCode(
  apiUrl: string,
  appId: string,
  code: string,
  state: string,
) {
  // #region example
  const token = await JsBaoClient.exchangeOAuthCode({
    apiUrl,
    appId,
    code,
    state,
  });
  // #endregion example
  return token;
}
