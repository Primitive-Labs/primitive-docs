import type { JsBaoClient } from "js-bao-wss-client";

// Emit a custom analytics event for an app-specific action.
export function logPhotoUploaded(client: JsBaoClient, currentUserUlid: string) {
  // #region example
  client.analytics.logEvent({
    action: "photo_uploaded",
    feature: "gallery",
    user_ulid: currentUserUlid,
    context_json: { resultCount: 42 },
  });
  // #endregion example
}
