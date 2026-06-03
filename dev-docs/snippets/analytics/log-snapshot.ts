import type { JsBaoClient } from "js-bao-wss-client";

// Emit a "snapshot" analytics event with arbitrary context.
// JS-only — the Swift client has no equivalent.
export function logSnapshot(client: JsBaoClient) {
  // #region example
  client.analytics.logSnapshot({ screen: "settings", theme: "dark" });
  // #endregion example
}
