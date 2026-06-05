import type { JsBaoClient } from "js-bao-wss-client";

// Read the current token, or set one obtained out-of-band.
export function manualToken(client: JsBaoClient, jwt: string) {
  // #region example
  client.getToken(); // string | null

  // Manually set a token (e.g. you obtained one out-of-band). Triggers
  // auth-success and pushes through the normal apply-token pipeline.
  client.setToken(jwt, { cause: "external" });
  // #endregion example
}
