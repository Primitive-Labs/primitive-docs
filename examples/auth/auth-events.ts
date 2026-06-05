import type { JsBaoClient } from "js-bao-wss-client";

// The canonical auth events. `auth-failed` and `auth:onlineAuthRequired`
// are the ones most apps must handle.
export function wireAuthEvents(
  client: JsBaoClient,
  redirectToLogin: () => void,
  promptSignIn: () => void,
  clearSensitiveUI: () => void,
  navigateHome: () => void
) {
  // #region example
  // Token refresh failed or server invalidated session — prompt re-login.
  client.on("auth-failed", ({ message, reason }) => {
    redirectToLogin();
  });

  // Token applied successfully (login, refresh, or OAuth callback).
  client.on("auth-success", ({ token, previousToken, cause }) => {
    // cause names the operation that produced the token. Stable values:
    //   Sign-in:    "oauthCallback" | "magicLinkVerify" | "otpVerify" | "passkeyAuth"
    //   Refresh:    "httpRefresh" | "ws-challenge" | "bootstrap:refresh" | "backoff-retry"
    //   Lifecycle:  "persisted-hydrate" | "ws-handshake" | "auto-network:online"
    //               | "networkMode:online" | "http-request"
    //   Manual:     "manual"
    // Treat unknown values as a generic success — the set may grow.
  });

  // Came back online without a valid token. Show sign-in.
  client.on("auth:onlineAuthRequired", () => {
    promptSignIn();
  });

  // Generic state machine event — fires on transitions.
  client.on("auth:state", ({ authenticated, mode, userId }) => {
    // mode: "online" | "offline" | "none" | "auto"
  });

  client.on("auth:logout", () => clearSensitiveUI());
  client.on("auth:logout:complete", () => navigateHome());
  // #endregion example
}
