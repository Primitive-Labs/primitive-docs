import type { JsBaoClient } from "js-bao-wss-client";

// Events are buffered and flushed automatically (every 100ms, on a full
// buffer, on beforeunload/visibility-hidden, and on reconnect). Call flush
// to force a send before an explicit teardown.
export function flushAnalytics(client: JsBaoClient) {
  // #region example
  client.analytics.flush();
  // #endregion example
}
