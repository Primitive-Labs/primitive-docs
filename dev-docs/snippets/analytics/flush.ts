import type { JsBaoClient } from "js-bao-wss-client";

// Force-flush the buffered analytics queue immediately.
export function flush(client: JsBaoClient) {
  // #region example
  client.analytics.flush();
  // #endregion example
}
