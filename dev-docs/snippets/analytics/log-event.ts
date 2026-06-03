import type { JsBaoClient } from "js-bao-wss-client";

// Emit a custom analytics event. `action` and `user_ulid` are required.
export function logEvent(client: JsBaoClient, userUlid: string) {
  // #region example
  client.analytics.logEvent({
    action: "photo_uploaded",
    feature: "gallery",
    user_ulid: userUlid,
  });
  // #endregion example
}
