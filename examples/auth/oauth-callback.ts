import type { JsBaoClient } from "js-bao-wss-client";

// OAuth callback page: extract code/state and complete the flow on an
// existing client instance.
export async function completeOAuth(client: JsBaoClient) {
  // #region example
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  if (code && state) {
    await client.handleOAuthCallback(code, state);
    // Token now stored, WebSocket reconnected. Navigate.
    window.location.href = "/";
  }
  // #endregion example
}
