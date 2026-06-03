import type { JsBaoClient } from "js-bao-wss-client";

// Fires when a queued blob upload fails (may still retry).
export function blobsUploadFailed(client: JsBaoClient) {
  // #region example
  client.on("blobs:upload-failed", (payload) => {
    console.log("failed", payload.blobId, payload.lastError, "retry:", payload.willRetry);
  });
  // #endregion example
}
