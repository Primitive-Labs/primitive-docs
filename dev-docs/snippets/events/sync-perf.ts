import type { JsBaoClient } from "js-bao-wss-client";

// Fires with sync-timing telemetry for a document.
export function syncPerf(client: JsBaoClient) {
  // #region example
  client.on("syncPerf", (payload) => {
    console.log(payload.documentId, payload.timings, payload.clientTimings);
  });
  // #endregion example
}
