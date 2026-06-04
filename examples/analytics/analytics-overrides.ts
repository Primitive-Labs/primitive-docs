import type { JsBaoClient } from "js-bao-wss-client";

// Set plan/app-version once on the client; they flow into every subsequent
// event automatically. Pass null to clear an override.
export function setAnalyticsOverrides(client: JsBaoClient) {
  // #region example
  client.analytics.setPlanOverride("pro");
  client.analytics.setAppVersionOverride("2.1.4");

  // Pass null to clear an override
  client.analytics.setPlanOverride(null);
  // #endregion example
}
