import type { JsBaoClient } from "js-bao-wss-client";

// The minimum auth wiring: one handler, three triggers.
export function wireMinimalAuthHandler(
  client: JsBaoClient,
  navigateToLogin: () => void
) {
  // #region example
  const promptLogin = () => navigateToLogin();
  client.on("auth-failed", promptLogin);
  client.on("auth:onlineAuthRequired", promptLogin);
  client.on("auth:state", ({ authenticated }) => {
    if (!authenticated) promptLogin();
  });
  // #endregion example
}
