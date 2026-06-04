import type { JsBaoClient } from "js-bao-wss-client";

// Override the `plan` and `app_version` fields stamped on every subsequent
// analytics event. Pass `null` to clear an override.
export function overrides(client: JsBaoClient) {
  // #region example
  client.analytics.setPlanOverride("pro");
  client.analytics.setAppVersionOverride("2.4.1");
  // #endregion example
}
