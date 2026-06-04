import type { JsBaoClient } from "js-bao-wss-client";

// Attach per-event debug data via `context_json`. It is serialized and
// truncated to 1 KiB, so keep it small — don't dump request bodies.
export function logSearchEvent(client: JsBaoClient, currentUserUlid: string) {
  // #region example
  client.analytics.logEvent({
    action: "search_executed",
    feature: "search",
    user_ulid: currentUserUlid,
    context_json: {
      query: "quarterly report",
      resultCount: 42,
    },
  });
  // #endregion example
}
