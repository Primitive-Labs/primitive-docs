import type { JsBaoClient } from "js-bao-wss-client";

// Emit a custom analytics event. `action` and `user_ulid` are required;
// `feature` groups related events for per-feature dashboards.
export function logFeatureEvent(client: JsBaoClient, currentUserUlid: string) {
  // #region example
  client.analytics.logEvent({
    action: "photo_uploaded",
    feature: "gallery",
    user_ulid: currentUserUlid,
  });
  // #endregion example
}
